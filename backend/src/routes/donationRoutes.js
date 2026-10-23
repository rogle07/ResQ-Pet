const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createDonation,
  createPosterCarePayment,
  confirmPayment,
  getDonationHistory,
  getDonationById,
  getDonationAnalytics,
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require('../controllers/donationController');

const router = express.Router();

// NOTE: the Stripe webhook route is mounted separately in app.js with express.raw()
// BEFORE the JSON body parser, since Stripe requires the raw request body to verify
// its signature. See app.js for /api/donations/webhook.

router.use(protect);

// Razorpay Order creation & signature verification
router.post(
  '/razorpay/order',
  [body('amount').isFloat({ min: 1 }).withMessage('A valid amount is required')],
  validate,
  createRazorpayOrder
);
router.post('/razorpay/verify', verifyRazorpayPayment);

// General donation (owner donate panel)
router.post(
  '/',
  [body('amount').isFloat({ min: 1 }).withMessage('A valid amount is required')],
  validate,
  createDonation
);

// Poster care / rescue request payment (owner poster care panel)
router.post(
  '/poster-care-payment',
  [
    body('amount').isFloat({ min: 1 }).withMessage('A valid service amount is required'),
    body('serviceType').notEmpty().withMessage('serviceType is required'),
  ],
  validate,
  createPosterCarePayment
);

router.post('/:id/confirm', confirmPayment);
router.get('/history', getDonationHistory);
router.get('/analytics', authorize('admin', 'ngo'), getDonationAnalytics);
router.get('/:id', getDonationById);

module.exports = router;
