const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getOverviewStats,
  getAppointments,
  createAppointment,
  updateAppointment,
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  getTreatments,
  createTreatment,
  updateTreatment,
  getPrescriptions,
  triggerCollarBuzzer,
  setCollarLed,
} = require('../controllers/veterinarianController');

// All veterinarian routes require authentication
router.use(protect);

router.get('/overview', getOverviewStats);

router.route('/appointments')
  .get(getAppointments)
  .post(createAppointment);

router.route('/appointments/:id')
  .patch(updateAppointment);

router.route('/records')
  .get(getMedicalRecords)
  .post(createMedicalRecord);

router.route('/records/:id')
  .get(getMedicalRecordById);

router.route('/treatments')
  .get(getTreatments)
  .post(createTreatment);

router.route('/treatments/:id')
  .patch(updateTreatment);

router.get('/prescriptions', getPrescriptions);

// IoT Collar Actuators
router.post('/actuators/buzzer', triggerCollarBuzzer);
router.post('/actuators/led', setCollarLed);

module.exports = router;
