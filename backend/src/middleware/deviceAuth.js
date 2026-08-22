// Simplified device authentication for IoT ingestion.
// The ESP32 (or the MQTT-to-HTTP bridge service) includes this header on every request.
// For a production rollout, upgrade to per-device API keys stored on the Pet.collar record.
const deviceAuth = (req, res, next) => {
  const deviceKey = req.headers['x-device-key'];

  if (!deviceKey || deviceKey !== process.env.IOT_DEVICE_KEY) {
    res.status(401);
    return next(new Error('Invalid or missing device key'));
  }

  next();
};

module.exports = deviceAuth;
