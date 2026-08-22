const asyncHandler = require('express-async-handler');
const Pet = require('../models/Pet');
const GpsLog = require('../models/GpsLog');
const { isInsideSafeZone } = require('../utils/geoUtils');
const { evaluateReading, handleEmergency } = require('../services/emergencyService');

// @desc    Ingest a GPS + sensor reading from a smart collar (ESP32 via MQTT bridge or direct HTTP)
// @route   POST /api/iot/reading
// @access  Private (device auth - simplified here to deviceId lookup; see note below)
const ingestReading = asyncHandler(async (req, res) => {
  const { deviceId, lat, lng, speedKmh, batteryPercent, temperatureC, accelerometer, movementDetected } = req.body;

  if (!deviceId || lat === undefined || lng === undefined) {
    res.status(400);
    throw new Error('deviceId, lat, and lng are required');
  }

  const pet = await Pet.findOne({ 'collar.deviceId': deviceId });
  if (!pet) {
    res.status(404);
    throw new Error('No pet is linked to this device ID');
  }

  const insideSafeZone = isInsideSafeZone(lat, lng, pet.safeZone);

  const log = await GpsLog.create({
    pet: pet._id,
    deviceId,
    lat,
    lng,
    speedKmh,
    batteryPercent,
    temperatureC,
    accelerometer,
    movementDetected: movementDetected ?? true,
    insideSafeZone,
  });

  // Update pet's cached last-known state for fast dashboard reads
  pet.lastKnownLocation = { lat, lng, updatedAt: new Date() };
  pet.collar.lastSeenAt = new Date();
  if (typeof batteryPercent === 'number') pet.collar.lastBatteryPercent = batteryPercent;
  await pet.save();

  const io = req.app.get('io');

  // Push live location to the owner's dashboard in real time
  io?.to(`owner:${pet.owner}`).emit('gps:update', {
    petId: pet._id,
    lat,
    lng,
    speedKmh,
    batteryPercent,
    temperatureC,
    insideSafeZone,
    recordedAt: log.recordedAt,
  });

  // Determine a rough "last movement" timestamp from recent logs for the no-movement rule
  const lastMovementLog = await GpsLog.findOne({ pet: pet._id, movementDetected: true }).sort('-recordedAt');

  const reasons = evaluateReading({
    lat,
    lng,
    temperatureC,
    movementDetected,
    accelerometer,
    batteryPercent,
    safeZone: pet.safeZone,
    lastMovementAt: lastMovementLog?.recordedAt,
  });

  let rescueRequest = null;
  if (reasons.length > 0) {
    rescueRequest = await handleEmergency(io, pet, reasons, { lat, lng });
  }

  res.status(201).json({
    success: true,
    logged: true,
    insideSafeZone,
    emergencyTriggered: !!rescueRequest,
    reasons,
  });
});

// @desc    Get GPS history for a pet (for map trail / analytics)
// @route   GET /api/iot/history/:petId
// @access  Private (owner or privileged roles)
const getGpsHistory = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.petId);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  const isOwner = pet.owner.toString() === req.user._id.toString();
  const privilegedRoles = ['admin', 'rescue_team'];
  if (!isOwner && !privilegedRoles.includes(req.user.role)) {
    res.status(403);
    throw new Error('Not authorized to view this pet\'s location history');
  }

  const limit = Math.min(Number(req.query.limit) || 200, 1000);
  const logs = await GpsLog.find({ pet: pet._id }).sort('-recordedAt').limit(limit);

  res.json({ success: true, count: logs.length, logs });
});

// @desc    Link a collar device to a pet
// @route   POST /api/iot/link-device
// @access  Private (owner)
const linkDevice = asyncHandler(async (req, res) => {
  const { petId, deviceId } = req.body;

  const pet = await Pet.findById(petId);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }
  if (pet.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const alreadyLinked = await Pet.findOne({ 'collar.deviceId': deviceId, _id: { $ne: pet._id } });
  if (alreadyLinked) {
    res.status(400);
    throw new Error('This device ID is already linked to another pet');
  }

  pet.collar.deviceId = deviceId;
  pet.collar.isActive = true;
  await pet.save();

  res.json({ success: true, pet });
});

module.exports = { ingestReading, getGpsHistory, linkDevice };
