const mongoose = require('mongoose');

const sensorReadingSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IoTDevice',
      index: true,
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    temperature: {
      type: Number,
      default: null,
    },
    humidity: {
      type: Number,
      default: null,
    },
    motion: {
      accelerationX: { type: Number, default: null },
      accelerationY: { type: Number, default: null },
      accelerationZ: { type: Number, default: null },
      totalAcceleration: { type: Number, default: null },
      gyroscopeX: { type: Number, default: null },
      gyroscopeY: { type: Number, default: null },
      gyroscopeZ: { type: Number, default: null },
      movementEstimate: { type: Number, default: null },
      activityStatus: { type: String, default: 'UNKNOWN' },
    },
    gps: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      fixValid: { type: Boolean, default: false },
      satellites: { type: Number, default: 0 },
      altitude: { type: Number, default: null },
      speed: { type: Number, default: null },
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// TTL: 30 days retention
sensorReadingSchema.index({ recordedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });
sensorReadingSchema.index({ pet: 1, recordedAt: -1 });
sensorReadingSchema.index({ deviceId: 1, recordedAt: -1 });

module.exports = mongoose.model('SensorReading', sensorReadingSchema);

