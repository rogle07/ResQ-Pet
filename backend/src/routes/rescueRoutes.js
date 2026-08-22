const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const validate = require('../middleware/validate');
const {
  createRescueRequest,
  getRescueRequests,
  getRescueRequestById,
  acceptRescueRequest,
  updateRescueStatus,
} = require('../controllers/rescueController');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  upload.array('photos', 4),
  [
    body('type').isIn(['emergency', 'lost_pet', 'injured_animal', 'stray']).withMessage('Valid type required'),
    body('lat').isFloat().withMessage('Valid latitude required'),
    body('lng').isFloat().withMessage('Valid longitude required'),
  ],
  validate,
  createRescueRequest
);

router.get('/', getRescueRequests);
router.get('/:id', getRescueRequestById);
router.post('/:id/accept', authorize('rescue_team', 'admin'), acceptRescueRequest);
router.put('/:id/status', authorize('rescue_team', 'admin'), upload.array('photos', 4), updateRescueStatus);

module.exports = router;
