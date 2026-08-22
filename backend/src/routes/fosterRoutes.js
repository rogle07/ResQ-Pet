const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createFosterRequest,
  getFosterRequests,
  getFosterRequestById,
  acceptFosterRequest,
  rejectFosterRequest,
  schedulePickup,
  sendFosterMessage,
  completeFosterRequest,
} = require('../controllers/fosterController');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('owner', 'admin'),
  [body('petId').notEmpty().withMessage('petId is required')],
  validate,
  createFosterRequest
);

router.get('/', getFosterRequests);
router.get('/:id', getFosterRequestById);
router.post('/:id/accept', authorize('foster_home', 'admin'), acceptFosterRequest);
router.post('/:id/reject', authorize('foster_home', 'admin'), rejectFosterRequest);
router.put('/:id/schedule-pickup', schedulePickup);
router.post(
  '/:id/messages',
  [body('text').trim().notEmpty().withMessage('Message text is required')],
  validate,
  sendFosterMessage
);
router.post('/:id/complete', completeFosterRequest);

module.exports = router;
