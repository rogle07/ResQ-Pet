const express = require('express');
const { protect } = require('../middleware/auth');
const {
  ingestDeviceData,
  getOwnerDevices,
  registerDevice,
  assignDevice,
  unlinkDevice,
  regenerateDeviceToken,
  deleteDevice,
  getPetLatestSensorReading,
  getPetSensorHistory,
  ingestReading,
  getGpsHistory,
  linkDevice,
} = require('../controllers/iotController');

const router = express.Router();

// ---------------------------------------------------------------------------
// Hardware / Device Ingestion Endpoints (Authenticated via Device Token)
// ---------------------------------------------------------------------------
router.post('/device-data', ingestDeviceData);
router.post('/reading', ingestReading); // Legacy alias

// ---------------------------------------------------------------------------
// Pet Owner IoT Dashboard & Management Endpoints (Authenticated via User JWT)
// ---------------------------------------------------------------------------
router.get('/devices', protect, getOwnerDevices);
router.post('/devices/register', protect, registerDevice);
router.post('/devices/assign', protect, assignDevice);
router.post('/devices/unlink', protect, unlinkDevice);
router.post('/devices/:deviceId/regenerate-token', protect, regenerateDeviceToken);
router.delete('/devices/:deviceId', protect, deleteDevice);

router.get('/latest/:petId', protect, getPetLatestSensorReading);
router.get('/history/:petId', protect, getPetSensorHistory);

// Legacy aliases
router.post('/link-device', protect, linkDevice);
router.get('/gps-history/:petId', protect, getGpsHistory);

module.exports = router;
