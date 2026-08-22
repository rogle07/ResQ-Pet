const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const validate = require('../middleware/validate');
const {
  createFoundReport,
  getFoundReports,
  getFoundReportById,
  claimFoundReport,
} = require('../controllers/foundReportController');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  upload.array('photos', 4),
  [
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('contactPhone').trim().notEmpty().withMessage('Contact phone is required'),
    body('lat').isFloat().withMessage('Valid latitude required'),
    body('lng').isFloat().withMessage('Valid longitude required'),
  ],
  validate,
  createFoundReport
);

router.get('/', getFoundReports);
router.get('/:id', getFoundReportById);
router.post('/:id/claim', claimFoundReport);

module.exports = router;
