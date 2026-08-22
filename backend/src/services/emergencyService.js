const RescueRequest = require('../models/RescueRequest');
const { notifyUser, broadcastToRescueTeams } = require('./notificationService');
const { isInsideSafeZone } = require('../utils/geoUtils');
const logger = require('../utils/logger');

const HIGH_TEMP_THRESHOLD_C = 39.5; // above normal canine/feline body temp
const NO_MOVEMENT_MINUTES = 30; // no movement detected for this long -> flag
const FALL_ACCEL_DELTA_G = 2.5; // sudden spike in accelerometer magnitude -> possible fall
const LOW_BATTERY_PERCENT = 15;

/**
 * Evaluates a single GPS/health reading against emergency rules.
 * Returns an array of triggered emergency reasons (empty if none).
 */
const evaluateReading = ({ lat, lng, temperatureC, movementDetected, accelerometer, batteryPercent, safeZone, lastMovementAt }) => {
  const reasons = [];

  if (!isInsideSafeZone(lat, lng, safeZone)) {
    reasons.push('geo_fence_exit');
  }

  if (typeof temperatureC === 'number' && temperatureC >= HIGH_TEMP_THRESHOLD_C) {
    reasons.push('high_temperature');
  }

  if (movementDetected === false && lastMovementAt) {
    const minutesSinceMovement = (Date.now() - new Date(lastMovementAt).getTime()) / 60000;
    if (minutesSinceMovement >= NO_MOVEMENT_MINUTES) {
      reasons.push('no_movement');
    }
  }

  if (accelerometer) {
    const magnitude = Math.sqrt(
      (accelerometer.x || 0) ** 2 + (accelerometer.y || 0) ** 2 + (accelerometer.z || 0) ** 2
    );
    // Baseline resting magnitude ~1g; a sharp spike suggests a fall/impact
    if (magnitude >= 1 + FALL_ACCEL_DELTA_G) {
      reasons.push('sudden_fall');
    }
  }

  if (typeof batteryPercent === 'number' && batteryPercent <= LOW_BATTERY_PERCENT) {
    reasons.push('low_battery');
  }

  return reasons;
};

/**
 * Handles a triggered emergency: creates a rescue request (if applicable),
 * notifies the owner, and broadcasts to rescue-team dashboards in real time.
 */
const handleEmergency = async (io, pet, reasons, location) => {
  const criticalReasons = reasons.filter((r) => r !== 'low_battery');

  if (criticalReasons.length === 0) {
    // Low battery alone is informational, not a rescue-worthy emergency
    if (reasons.includes('low_battery')) {
      await notifyUser(io, {
        recipient: pet.owner,
        type: 'low_battery',
        title: `${pet.name}'s collar battery is low`,
        message: `Battery is below ${LOW_BATTERY_PERCENT}%. Please recharge the smart collar soon.`,
        relatedPet: pet._id,
      });
    }
    return null;
  }

  const reasonLabels = {
    geo_fence_exit: 'exited the safe zone',
    high_temperature: 'has an abnormally high body temperature',
    no_movement: 'has shown no movement for an extended period',
    sudden_fall: 'may have experienced a sudden fall or impact',
  };

  const description = criticalReasons.map((r) => reasonLabels[r] || r).join('; ');

  const rescueRequest = await RescueRequest.create({
    pet: pet._id,
    requestedBy: pet.owner,
    type: 'emergency',
    description: `Automated alert: ${pet.name} ${description}.`,
    location: { lat: location.lat, lng: location.lng },
    priority: criticalReasons.includes('sudden_fall') || criticalReasons.includes('high_temperature') ? 'critical' : 'high',
    timeline: [{ status: 'pending', note: 'Auto-created by IoT emergency detection' }],
  });

  await notifyUser(io, {
    recipient: pet.owner,
    type: 'emergency',
    title: `Emergency detected for ${pet.name}`,
    message: `${pet.name} ${description}. A rescue alert has been created.`,
    relatedPet: pet._id,
    channel: ['in_app', 'push', 'email'],
  });

  broadcastToRescueTeams(io, 'emergency:new', {
    rescueRequestId: rescueRequest._id,
    petId: pet._id,
    petName: pet.name,
    reasons: criticalReasons,
    location,
  });

  logger.warn(`Emergency created for pet ${pet._id}: ${criticalReasons.join(', ')}`);

  return rescueRequest;
};

module.exports = { evaluateReading, handleEmergency, HIGH_TEMP_THRESHOLD_C, LOW_BATTERY_PERCENT };
