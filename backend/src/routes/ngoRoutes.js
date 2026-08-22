const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  getNgoDirectory,
  getNgoDashboard,
  addMedicalRecord,
  getMedicalRecords,
} = require('../controllers/ngoController');

const router = express.Router();

router.get('/directory', getNgoDirectory);

router.use(protect);

router.get('/dashboard', authorize('ngo', 'admin'), getNgoDashboard);

router.post(
  '/medical-records',
  authorize('ngo', 'veterinarian', 'admin'),
  [body('petId').notEmpty().withMessage('petId is required')],
  validate,
  addMedicalRecord
);

router.get('/medical-records/:petId', getMedicalRecords);

module.exports = router;
