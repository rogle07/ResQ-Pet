const asyncHandler = require('express-async-handler');
const Stripe = require('stripe');
const Donation = require('../models/Donation');
const { notifyUser } = require('../services/notificationService');

// Stripe is optional (donations are one module among many). Instantiating it
// eagerly at require-time would crash the entire server on boot if
// STRIPE_SECRET_KEY isn't set — which previously happened even when nobody
// was using the donations feature. Instead we create the client lazily, only
// when a donation route actually runs, and fail with a clear API error
// rather than taking the whole app down.
let stripeClient = null;
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    const err = new Error('Donations are not available: Stripe is not configured on this server.');
    err.statusCode = 503;
    throw err;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
};

// @desc    Create a donation + Stripe PaymentIntent
// @route   POST /api/donations
// @access  Private
const createDonation = asyncHandler(async (req, res) => {
  const { ngoId, type, amount, currency, isRecurring, message } = req.body;

  if (!amount || amount < 1) {
    res.status(400);
    throw new Error('A valid donation amount is required');
  }

  const paymentIntent = await getStripe().paymentIntents.create({
    amount: Math.round(amount * 100), // Stripe expects the smallest currency unit
    currency: currency || 'usd',
    metadata: { donorId: req.user._id.toString(), type },
  });

  const donation = await Donation.create({
    donor: req.user._id,
    ngo: ngoId || undefined,
    type,
    amount,
    currency: currency || 'USD',
    paymentIntentId: paymentIntent.id,
    isRecurring: !!isRecurring,
    message,
    status: 'pending',
  });

  res.status(201).json({
    success: true,
    donation,
    clientSecret: paymentIntent.client_secret,
  });
});

// @desc    Stripe webhook - confirms payment success/failure
// @route   POST /api/donations/webhook
// @access  Public (verified via Stripe signature)
const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    res.status(400);
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  const io = req.app.get('io');

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const donation = await Donation.findOneAndUpdate(
      { paymentIntentId: intent.id },
      { status: 'succeeded' },
      { new: true }
    );

    if (donation) {
      await notifyUser(io, {
        recipient: donation.donor,
        type: 'donation_success',
        title: 'Thank you for your donation!',
        message: `Your donation of ${donation.amount} ${donation.currency} was successful.`,
      });
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    await Donation.findOneAndUpdate({ paymentIntentId: intent.id }, { status: 'failed' });
  }

  res.json({ received: true });
});

// @desc    Get donation history for logged-in user
// @route   GET /api/donations/history
// @access  Private
const getDonationHistory = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ donor: req.user._id }).sort('-createdAt');
  res.json({ success: true, count: donations.length, donations });
});

// @desc    Donation analytics (admin / NGO)
// @route   GET /api/donations/analytics
// @access  Private (admin, ngo)
const getDonationAnalytics = asyncHandler(async (req, res) => {
  const matchStage = { status: 'succeeded' };
  if (req.user.role === 'ngo') matchStage.ngo = req.user._id;

  const [totals, byType, monthly] = await Promise.all([
    Donation.aggregate([{ $match: matchStage }, { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }]),
    Donation.aggregate([{ $match: matchStage }, { $group: { _id: '$type', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } }]),
    Donation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  res.json({
    success: true,
    totals: totals[0] || { totalAmount: 0, count: 0 },
    byType,
    monthly,
  });
});

module.exports = { createDonation, stripeWebhook, getDonationHistory, getDonationAnalytics };
