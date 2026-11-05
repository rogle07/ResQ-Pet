const mongoose = require('mongoose');

const ioTDeviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    deviceName: {
      type: String,
      trim: true,
      default: 'Smart Collar',
    },
    deviceToken: {
      type: String,
      required: true,
      select: false, // Hidden by default from normal queries
    },
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ['registered', 'active', 'offline', 'unlinked'],
      default: 'registered',
      index: true,
    },
    lastCommunicationAt: {
      type: Date,
      default: null,
    },
    lastReading: {
      temperature: { type: Number, default: null },
      humidity: { type: Number, default: null },
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
      timestamp: { type: Date, default: null },
    },
    lastValidGps: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      altitude: { type: Number, default: null },
      speed: { type: Number, default: null },
      satellites: { type: Number, default: 0 },
      recordedAt: { type: Date, default: null },
    },
    hardware: {
      model: { type: String, default: 'ESP32-C3 SuperMini' },
      sensors: { type: [String], default: ['MPU6050/6500', 'DHT11', 'NEO-6M GPS'] },
      firmwareVersion: { type: String, default: '1.0.0' },
    },
  },
  { timestamps: true }
);

ioTDeviceSchema.index({ owner: 1, pet: 1 });

module.exports = mongoose.model('IoTDevice', ioTDeviceSchema);

