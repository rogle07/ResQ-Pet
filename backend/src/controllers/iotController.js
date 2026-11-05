const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const Pet = require('../models/Pet');
const GpsLog = require('../models/GpsLog');
const IoTDevice = require('../models/IoTDevice');
const SensorReading = require('../models/SensorReading');
const { isInsideSafeZone } = require('../utils/geoUtils');
const { evaluateReading, handleEmergency } = require('../services/emergencyService');
const logger = require('../utils/logger');

// Helper to hash a device token
const hashToken = (token) => {
  return crypto.createHash('sha256').update(String(token).trim()).digest('hex');
};

// Helper to calculate connection status based on last communication
const getConnectionStatus = (lastCommunicationAt) => {
  if (!lastCommunicationAt) return 'pending_connection';
  const diffMs = Date.now() - new Date(lastCommunicationAt).getTime();
  // Within 2.5 minutes is considered online (typical publish interval is 10-15s)
  return diffMs <= 150000 ? 'online' : 'offline';
};

// ============================================================================
// HARDWARE / DEVICE INGESTION ENDPOINTS
// ============================================================================

// @desc    Ingest sensor readings from ESP32-C3 wearable device via HTTPS POST
// @route   POST /api/iot/device-data
// @access  Device Auth (x-device-token header or Bearer token)
const ingestDeviceData = asyncHandler(async (req, res) => {
  const { deviceId, temperature, humidity, motion, gps, timestamp } = req.body;

  if (!deviceId) {
    res.status(400);
    throw new Error('deviceId is required');
  }

  // 1. Authenticate Device Token
  const rawToken =
    req.headers['x-device-token'] ||
    req.headers['x-device-key'] ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!rawToken) {
    res.status(401);
    throw new Error('Device authentication token is missing');
  }

  const tokenHash = hashToken(rawToken);

  // Look up device by unique uppercase deviceId
  const normalizedDeviceId = String(deviceId).trim().toUpperCase();
  const device = await IoTDevice.findOne({ deviceId: normalizedDeviceId }).select('+deviceToken');

  let isAuthenticated = false;

  if (device) {
    if (device.tokenHash === tokenHash || device.deviceToken === rawToken) {
      isAuthenticated = true;
    }
  }

  // Fallback to global IOT_DEVICE_KEY from .env for legacy / test setups
  if (!isAuthenticated && process.env.IOT_DEVICE_KEY && rawToken === process.env.IOT_DEVICE_KEY) {
    isAuthenticated = true;
  }

  if (!isAuthenticated || !device) {
    res.status(401);
    throw new Error('Invalid device credentials or unregistered device ID');
  }

  // 2. Validate Device & Pet Assignment
  if (!device.pet) {
    // Device is registered in system but not assigned to any pet yet
    device.lastCommunicationAt = new Date();
    await device.save();
    return res.status(200).json({
      success: true,
      message: 'Device connected but not yet assigned to a pet. Please assign it in your Pet Owner dashboard.',
      assigned: false,
    });
  }

  const pet = await Pet.findById(device.pet);
  if (!pet) {
    res.status(404);
    throw new Error('Assigned pet record not found');
  }

  // 3. Process & Validate GPS Data (STRICT RULE: Never accept (0,0) as a valid fix)
  let validGpsFix = false;
  let cleanLat = null;
  let cleanLng = null;
  let cleanSatellites = 0;
  let cleanAltitude = null;
  let cleanSpeed = null;

  if (gps && gps.fixValid === true) {
    const latNum = Number(gps.latitude);
    const lngNum = Number(gps.longitude);

    // Coordinate sanity check: real coordinates cannot be 0,0 and must be within physical ranges
    if (
      !isNaN(latNum) &&
      !isNaN(lngNum) &&
      (latNum !== 0 || lngNum !== 0) &&
      latNum >= -90 &&
      latNum <= 90 &&
      lngNum >= -180 &&
      lngNum <= 180
    ) {
      validGpsFix = true;
      cleanLat = latNum;
      cleanLng = lngNum;
      cleanSatellites = Number(gps.satellites) || 0;
      cleanAltitude = typeof gps.altitude === 'number' && !isNaN(gps.altitude) ? gps.altitude : null;
      cleanSpeed = typeof gps.speed === 'number' && !isNaN(gps.speed) ? gps.speed : null;
    }
  }

  // 4. Process Motion Data
  const motionData = {
    accelerationX: typeof motion?.accelerationX === 'number' ? motion.accelerationX : null,
    accelerationY: typeof motion?.accelerationY === 'number' ? motion.accelerationY : null,
    accelerationZ: typeof motion?.accelerationZ === 'number' ? motion.accelerationZ : null,
    totalAcceleration: typeof motion?.totalAcceleration === 'number' ? motion.totalAcceleration : null,
    gyroscopeX: typeof motion?.gyroscopeX === 'number' ? motion.gyroscopeX : null,
    gyroscopeY: typeof motion?.gyroscopeY === 'number' ? motion.gyroscopeY : null,
    gyroscopeZ: typeof motion?.gyroscopeZ === 'number' ? motion.gyroscopeZ : null,
    movementEstimate: typeof motion?.movementEstimate === 'number' ? motion.movementEstimate : 0,
    activityStatus: motion?.activityStatus || 'RESTING',
  };

  // 5. Clean Temperature & Humidity
  const tempNum = typeof temperature === 'number' && !isNaN(temperature) ? temperature : null;
  const humNum = typeof humidity === 'number' && !isNaN(humidity) ? humidity : null;
  const recordedAt = timestamp ? new Date(timestamp) : new Date();

  // 6. Store SensorReading in MongoDB
  const sensorReading = await SensorReading.create({
    deviceId: device.deviceId,
    device: device._id,
    pet: pet._id,
    owner: device.owner,
    temperature: tempNum,
    humidity: humNum,
    motion: motionData,
    gps: {
      latitude: cleanLat,
      longitude: cleanLng,
      fixValid: validGpsFix,
      satellites: cleanSatellites,
      altitude: cleanAltitude,
      speed: cleanSpeed,
    },
    recordedAt,
  });

  // 7. Update IoTDevice state
  device.lastCommunicationAt = new Date();
  device.status = 'active';
  device.lastReading = {
    temperature: tempNum,
    humidity: humNum,
    motion: motionData,
    gps: {
      latitude: cleanLat,
      longitude: cleanLng,
      fixValid: validGpsFix,
      satellites: cleanSatellites,
      altitude: cleanAltitude,
      speed: cleanSpeed,
    },
    timestamp: recordedAt,
  };

  if (validGpsFix) {
    device.lastValidGps = {
      latitude: cleanLat,
      longitude: cleanLng,
      altitude: cleanAltitude,
      speed: cleanSpeed,
      satellites: cleanSatellites,
      recordedAt: new Date(),
    };

    // Update Pet's lastKnownLocation
    pet.lastKnownLocation = {
      lat: cleanLat,
      lng: cleanLng,
      updatedAt: new Date(),
    };

    // Also create GpsLog for safe-zone / rescue evaluation
    const insideSafeZone = isInsideSafeZone(cleanLat, cleanLng, pet.safeZone);
    await GpsLog.create({
      pet: pet._id,
      deviceId: device.deviceId,
      lat: cleanLat,
      lng: cleanLng,
      speedKmh: cleanSpeed,
      temperatureC: tempNum,
      accelerometer: {
        x: motionData.accelerationX,
        y: motionData.accelerationY,
        z: motionData.accelerationZ,
      },
      movementDetected: (motionData.movementEstimate || 0) > 0.05,
      insideSafeZone,
      recordedAt,
    });
  }

  // Update Pet's collar state
  pet.collar.lastSeenAt = new Date();
  pet.collar.isActive = true;
  await pet.save();
  await device.save();

  // 8. Real-time updates via Socket.IO
  const io = req.app.get('io');
  if (io) {
    // Notify pet owner's dashboard in real-time
    io.to(`owner:${device.owner}`).emit('iot:sensor-update', {
      petId: pet._id,
      deviceId: device.deviceId,
      reading: sensorReading,
      lastValidGps: device.lastValidGps,
      connectionStatus: 'online',
    });

    if (validGpsFix) {
      io.to(`owner:${device.owner}`).emit('gps:update', {
        petId: pet._id,
        lat: cleanLat,
        lng: cleanLng,
        speedKmh: cleanSpeed,
        temperatureC: tempNum,
        recordedAt,
      });
    }
  }

  // 9. Emergency evaluation (e.g. extreme heat, sudden fall shock)
  try {
    const reasons = evaluateReading({
      lat: cleanLat || pet.lastKnownLocation?.lat || 0,
      lng: cleanLng || pet.lastKnownLocation?.lng || 0,
      temperatureC: tempNum,
      movementDetected: (motionData.movementEstimate || 0) > 0.05,
      accelerometer: {
        x: motionData.accelerationX,
        y: motionData.accelerationY,
        z: motionData.accelerationZ,
      },
      safeZone: pet.safeZone,
    });

    if (reasons.length > 0 && validGpsFix) {
      await handleEmergency(io, pet, reasons, { lat: cleanLat, lng: cleanLng });
    }
  } catch (err) {
    logger.warn(`Emergency evaluation warning: ${err.message}`);
  }

  res.status(201).json({
    success: true,
    message: 'Sensor data recorded successfully',
    readingId: sensorReading._id,
    fixValid: validGpsFix,
    petId: pet._id,
    timestamp: recordedAt,
  });
});

// ============================================================================
// PET OWNER IoT MANAGEMENT ENDPOINTS
// ============================================================================

// @desc    Get all wearable devices registered by the authenticated owner
// @route   GET /api/iot/devices
// @access  Private (owner)
const getOwnerDevices = asyncHandler(async (req, res) => {
  const devices = await IoTDevice.find({ owner: req.user._id })
    .populate('pet', 'name species breed collar status lastKnownLocation images')
    .sort('-createdAt');

  const formatted = devices.map((dev) => {
    const connStatus = getConnectionStatus(dev.lastCommunicationAt);
    return {
      _id: dev._id,
      deviceId: dev.deviceId,
      deviceName: dev.deviceName,
      status: dev.status,
      connectionStatus: connStatus,
      lastCommunicationAt: dev.lastCommunicationAt,
      pet: dev.pet,
      lastReading: dev.lastReading,
      lastValidGps: dev.lastValidGps,
      hardware: dev.hardware,
      createdAt: dev.createdAt,
    };
  });

  res.json({ success: true, count: formatted.length, devices: formatted });
});

// @desc    Register a new wearable device
// @route   POST /api/iot/devices/register
// @access  Private (owner)
const registerDevice = asyncHandler(async (req, res) => {
  const { deviceId, deviceName, petId } = req.body;

  let assignedId = deviceId ? String(deviceId).trim().toUpperCase() : null;
  if (!assignedId) {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    assignedId = `RQP-ESP32-${randomHex}`;
  }

  // Validate format
  if (!/^[A-Z0-9\-_]{4,32}$/i.test(assignedId)) {
    res.status(400);
    throw new Error('Device ID must be 4-32 alphanumeric characters, dashes, or underscores');
  }

  // Check if device already exists
  const existingDevice = await IoTDevice.findOne({ deviceId: assignedId });
  if (existingDevice) {
    if (existingDevice.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('This Device ID is already registered to another user account');
    } else {
      res.status(400);
      throw new Error('You have already registered this Device ID');
    }
  }

  // Generate a secure raw device authentication token (32 characters hex)
  const rawToken = `rqp_sec_${crypto.randomBytes(20).toString('hex')}`;
  const tokenHash = hashToken(rawToken);

  let assignedPet = null;
  if (petId) {
    assignedPet = await Pet.findById(petId);
    if (!assignedPet) {
      res.status(404);
      throw new Error('Selected pet not found');
    }
    if (assignedPet.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to assign device to this pet');
    }
  }

  const device = await IoTDevice.create({
    deviceId: assignedId,
    deviceName: deviceName || 'Smart Collar',
    deviceToken: rawToken,
    tokenHash,
    owner: req.user._id,
    pet: assignedPet ? assignedPet._id : null,
    status: 'registered',
  });

  if (assignedPet) {
    assignedPet.collar.deviceId = assignedId;
    assignedPet.collar.isActive = true;
    await assignedPet.save();
  }

  res.status(201).json({
    success: true,
    message: 'Wearable device registered successfully. Copy the device token now to flash into your ESP32.',
    device: {
      _id: device._id,
      deviceId: device.deviceId,
      deviceName: device.deviceName,
      pet: assignedPet ? { _id: assignedPet._id, name: assignedPet.name } : null,
      status: device.status,
      connectionStatus: 'pending_connection',
    },
    deviceToken: rawToken, // Returned ONLY during registration for hardware setup
  });
});

// @desc    Assign / link a device to a pet
// @route   POST /api/iot/devices/assign
// @access  Private (owner)
const assignDevice = asyncHandler(async (req, res) => {
  const { deviceId, petId } = req.body;

  if (!deviceId || !petId) {
    res.status(400);
    throw new Error('Both deviceId and petId are required');
  }

  const normalizedDeviceId = String(deviceId).trim().toUpperCase();
  const device = await IoTDevice.findOne({ deviceId: normalizedDeviceId });
  if (!device) {
    res.status(404);
    throw new Error('Device not found');
  }

  if (device.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to configure this device');
  }

  const pet = await Pet.findById(petId);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  if (pet.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to assign to this pet');
  }

  // If another device was linked to this pet, unlink it first
  await IoTDevice.updateMany(
    { pet: pet._id, _id: { $ne: device._id } },
    { $set: { pet: null, status: 'unlinked' } }
  );

  // If this device was linked to another pet, clear that pet's collar
  if (device.pet && device.pet.toString() !== pet._id.toString()) {
    await Pet.findByIdAndUpdate(device.pet, {
      $set: { 'collar.deviceId': null, 'collar.isActive': false },
    });
  }

  device.pet = pet._id;
  device.status = device.lastCommunicationAt ? 'active' : 'registered';
  await device.save();

  pet.collar.deviceId = device.deviceId;
  pet.collar.isActive = true;
  await pet.save();

  res.json({
    success: true,
    message: `Device ${device.deviceId} assigned to ${pet.name}`,
    device: {
      deviceId: device.deviceId,
      pet: { _id: pet._id, name: pet.name },
    },
  });
});

// @desc    Unlink / unassign a device from its pet
// @route   POST /api/iot/devices/unlink
// @access  Private (owner)
const unlinkDevice = asyncHandler(async (req, res) => {
  const { deviceId } = req.body;

  if (!deviceId) {
    res.status(400);
    throw new Error('deviceId is required');
  }

  const normalizedDeviceId = String(deviceId).trim().toUpperCase();
  const device = await IoTDevice.findOne({ deviceId: normalizedDeviceId });
  if (!device) {
    res.status(404);
    throw new Error('Device not found');
  }

  if (device.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (device.pet) {
    await Pet.findByIdAndUpdate(device.pet, {
      $set: { 'collar.deviceId': null, 'collar.isActive': false },
    });
  }

  device.pet = null;
  device.status = 'unlinked';
  await device.save();

  res.json({
    success: true,
    message: `Device ${device.deviceId} unlinked from pet`,
  });
});

// @desc    Regenerate authentication token for a device
// @route   POST /api/iot/devices/:deviceId/regenerate-token
// @access  Private (owner)
const regenerateDeviceToken = asyncHandler(async (req, res) => {
  const normalizedDeviceId = String(req.params.deviceId).trim().toUpperCase();
  const device = await IoTDevice.findOne({ deviceId: normalizedDeviceId });

  if (!device) {
    res.status(404);
    throw new Error('Device not found');
  }

  if (device.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const rawToken = `rqp_sec_${crypto.randomBytes(20).toString('hex')}`;
  device.deviceToken = rawToken;
  device.tokenHash = hashToken(rawToken);
  await device.save();

  res.json({
    success: true,
    message: 'New device token generated. Please re-flash this token into your ESP32.',
    deviceToken: rawToken,
  });
});

// @desc    Delete a device
// @route   DELETE /api/iot/devices/:deviceId
// @access  Private (owner)
const deleteDevice = asyncHandler(async (req, res) => {
  const normalizedDeviceId = String(req.params.deviceId).trim().toUpperCase();
  const device = await IoTDevice.findOne({ deviceId: normalizedDeviceId });

  if (!device) {
    res.status(404);
    throw new Error('Device not found');
  }

  if (device.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (device.pet) {
    await Pet.findByIdAndUpdate(device.pet, {
      $set: { 'collar.deviceId': null, 'collar.isActive': false },
    });
  }

  await IoTDevice.deleteOne({ _id: device._id });

  res.json({ success: true, message: 'Device deleted successfully' });
});

// @desc    Get latest sensor telemetry for a pet
// @route   GET /api/iot/latest/:petId
// @access  Private (owner, rescue_team, admin)
const getPetLatestSensorReading = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.petId);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  const isOwner = pet.owner.toString() === req.user._id.toString();
  const privileged = ['admin', 'rescue_team'].includes(req.user.role);
  if (!isOwner && !privileged) {
    res.status(403);
    throw new Error('Not authorized to view telemetry for this pet');
  }

  const device = await IoTDevice.findOne({ pet: pet._id });
  const latestReading = await SensorReading.findOne({ pet: pet._id }).sort('-recordedAt');

  const connectionStatus = device ? getConnectionStatus(device.lastCommunicationAt) : 'not_registered';

  res.json({
    success: true,
    pet: {
      _id: pet._id,
      name: pet.name,
      species: pet.species,
      lastKnownLocation: pet.lastKnownLocation,
      safeZone: pet.safeZone,
    },
    device: device
      ? {
          deviceId: device.deviceId,
          deviceName: device.deviceName,
          status: device.status,
          connectionStatus,
          lastCommunicationAt: device.lastCommunicationAt,
          lastValidGps: device.lastValidGps,
          hardware: device.hardware,
        }
      : null,
    reading: latestReading || device?.lastReading || null,
  });
});

// @desc    Get sensor history (telemetry trends) for a pet
// @route   GET /api/iot/history/:petId
// @access  Private (owner, rescue_team, admin)
const getPetSensorHistory = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.petId);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  const isOwner = pet.owner.toString() === req.user._id.toString();
  const privileged = ['admin', 'rescue_team'].includes(req.user.role);
  if (!isOwner && !privileged) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const limit = Math.min(Number(req.query.limit) || 60, 500);
  const readings = await SensorReading.find({ pet: pet._id })
    .sort('-recordedAt')
    .limit(limit);

  // Return chronological order for easy charting
  res.json({
    success: true,
    count: readings.length,
    readings: readings.reverse(),
  });
});

// Legacy backward compatibility:
const ingestReading = asyncHandler(async (req, res) => {
  // Map legacy format to new format
  req.body = {
    deviceId: req.body.deviceId,
    temperature: req.body.temperatureC,
    humidity: null,
    motion: {
      accelerationX: req.body.accelerometer?.x,
      accelerationY: req.body.accelerometer?.y,
      accelerationZ: req.body.accelerometer?.z,
      movementEstimate: req.body.movementDetected ? 0.2 : 0.01,
      activityStatus: req.body.movementDetected ? 'ACTIVE' : 'RESTING',
    },
    gps: {
      latitude: req.body.lat,
      longitude: req.body.lng,
      fixValid: req.body.lat !== undefined && req.body.lng !== undefined && req.body.lat !== 0,
      satellites: 4,
      speed: req.body.speedKmh,
    },
  };
  return ingestDeviceData(req, res);
});

const getGpsHistory = getPetSensorHistory;
const linkDevice = assignDevice;

module.exports = {
  ingestDeviceData,
  getOwnerDevices,
  registerDevice,
  assignDevice,
  unlinkDevice,
  regenerateDeviceToken,
  deleteDevice,
  getPetLatestSensorReading,
  getPetSensorHistory,
  // Backward compatibility
  ingestReading,
  getGpsHistory,
  linkDevice,
};
