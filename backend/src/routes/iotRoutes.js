const express = require('express');
const { protect } = require('../middleware/auth');
const deviceAuth = require('../middleware/deviceAuth');
const { ingestReading, getGpsHistory, linkDevice } = require('../controllers/iotController');

const router = express.Router();

// Called by the ESP32 collar / MQTT bridge - authenticated via shared device key, not user JWT
router.post('/reading', deviceAuth, ingestReading);

// User-facing endpoints
router.get('/history/:petId', protect, getGpsHistory);
router.post('/link-device', protect, linkDevice);

module.exports = router;
