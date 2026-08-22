const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createDonation,
  getDonationHistory,
  getDonationAnalytics,
} = require('../controllers/donationController');

const router = express.Router();

// NOTE: the Stripe webhook route is mounted separately in app.js with express.raw()
// BEFORE the JSON body parser, since Stripe requires the raw request body to verify
// its signature. See app.js for /api/donations/webhook.

router.use(protect);

router.post(
  '/',
  [body('amount').isFloat({ min: 1 }).withMessage('A valid amount is required')],
  validate,
  createDonation
);

router.get('/history', getDonationHistory);
router.get('/analytics', authorize('admin', 'ngo'), getDonationAnalytics);

module.exports = router;
