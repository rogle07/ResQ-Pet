const mongoose = require('mongoose');

const gpsLogSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true, index: true },
    deviceId: { type: String, required: true, index: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    speedKmh: Number,
    batteryPercent: Number,
    temperatureC: Number,
    accelerometer: {
      x: Number,
      y: Number,
      z: Number,
    },
    movementDetected: { type: Boolean, default: true },
    insideSafeZone: { type: Boolean, default: true },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// TTL: auto-purge raw logs after 90 days to keep collection lean (adjust as needed)
gpsLogSchema.index({ recordedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
gpsLogSchema.index({ pet: 1, recordedAt: -1 });

module.exports = mongoose.model('GpsLog', gpsLogSchema);
