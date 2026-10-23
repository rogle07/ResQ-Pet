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

// Razorpay client lazy-loader
let razorpayClient = null;
const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    const err = new Error('Payments are not available: Razorpay is not configured on this server.');
    err.statusCode = 503;
    throw err;
  }
  if (!razorpayClient) {
    const Razorpay = require('razorpay');
    razorpayClient = new Razorpay({ key_id, key_secret });
  }
  return razorpayClient;
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

  let paymentIntentId = `pi_demo_${Date.now()}`;
  let clientSecret = `pi_demo_${Date.now()}_secret_${Math.random().toString(36).substring(2, 10)}`;
  let isDemoMode = false;

  try {
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects smallest currency unit
      currency: (currency || 'inr').toLowerCase(),
      metadata: { donorId: req.user._id.toString(), type },
    });
    paymentIntentId = paymentIntent.id;
    clientSecret = paymentIntent.client_secret;
  } catch (stripeErr) {
    console.warn('[Donation] Stripe unavailable or placeholder key, continuing in demo mode:', stripeErr.message);
    isDemoMode = true;
  }

  const donation = await Donation.create({
    donor: req.user._id,
    ngo: ngoId || undefined,
    type,
    amount,
    currency: (currency || 'INR').toUpperCase(),
    paymentIntentId,
    isRecurring: !!isRecurring,
    message,
    status: isDemoMode ? 'succeeded' : 'pending',
  });

  res.status(201).json({
    success: true,
    donation,
    clientSecret,
    isDemoMode,
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

// @desc    Create a Stripe PaymentIntent for a poster / care-request service fee
// @route   POST /api/donations/poster-care-payment
// @access  Private (owner)
const createPosterCarePayment = asyncHandler(async (req, res) => {
  const { amount, serviceType, currency, relatedRequestId, message } = req.body;

  if (!amount || amount < 1) {
    res.status(400);
    throw new Error('A valid service amount is required');
  }

  let paymentIntentId = `pi_demo_poster_${Date.now()}`;
  let clientSecret = `pi_demo_poster_${Date.now()}_secret_${Math.random().toString(36).substring(2, 10)}`;
  let isDemoMode = false;

  try {
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: (currency || 'inr').toLowerCase(),
      metadata: {
        ownerId: req.user._id.toString(),
        serviceType: serviceType || 'poster_care',
        relatedRequestId: relatedRequestId || '',
      },
    });
    paymentIntentId = paymentIntent.id;
    clientSecret = paymentIntent.client_secret;
  } catch (stripeErr) {
    console.warn('[PosterCarePayment] Stripe unavailable or placeholder key, continuing in demo mode:', stripeErr.message);
    isDemoMode = true;
  }

  const donation = await Donation.create({
    donor: req.user._id,
    type: 'rescue',
    amount,
    currency: (currency || 'INR').toUpperCase(),
    paymentIntentId,
    isRecurring: false,
    message: message || `Poster care service fee — ${serviceType}`,
    status: isDemoMode ? 'succeeded' : 'pending',
  });

  res.status(201).json({
    success: true,
    donation,
    clientSecret,
    serviceType,
    isDemoMode,
  });
});

// @desc    Confirm a donation/payment once completed (e.g. via Stripe Elements or demo)
// @route   POST /api/donations/:id/confirm
// @access  Private
const confirmPayment = asyncHandler(async (req, res) => {
  const donation = await Donation.findOne({ _id: req.params.id, donor: req.user._id });
  if (!donation) {
    res.status(404);
    throw new Error('Payment record not found');
  }
  donation.status = 'succeeded';
  await donation.save();
  res.json({ success: true, donation });
});

// @desc    Get a single donation by ID (for receipt)
// @route   GET /api/donations/:id
// @access  Private
const getDonationById = asyncHandler(async (req, res) => {
  const donation = await Donation.findOne({ _id: req.params.id, donor: req.user._id });
  if (!donation) {
    res.status(404);
    throw new Error('Donation not found');
  }
  res.json({ success: true, donation });
});

// @desc    Create a Razorpay order for donation, foster care, or adoption fee
// @route   POST /api/donations/razorpay/order
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency, purpose, notes } = req.body;

  if (!amount || amount < 1) {
    res.status(400);
    throw new Error('A valid payment amount is required');
  }

  const razorpay = getRazorpay();
  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100), // convert to paise
    currency: (currency || 'INR').toUpperCase(),
    receipt: `rcpt_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
    notes: {
      userId: req.user._id.toString(),
      userName: req.user.name || '',
      purpose: purpose || 'donation',
      ...(notes || {}),
    },
  });

  res.status(201).json({
    success: true,
    order,
    keyId: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc    Verify Razorpay payment signature and record payment in database
// @route   POST /api/donations/razorpay/verify
// @access  Private
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount,
    currency,
    purpose,
    message,
  } = req.body;

  if (!razorpay_payment_id) {
    res.status(400);
    throw new Error('razorpay_payment_id is required');
  }

  // Signature verification when order_id and signature are provided
  if (razorpay_order_id && razorpay_signature) {
    const crypto = require('crypto');
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) {
      res.status(400);
      throw new Error('Razorpay payment signature verification failed');
    }
  }

  // Record payment in Donation collection
  const donation = await Donation.create({
    donor: req.user._id,
    type: purpose === 'foster_care' || purpose === 'adopter_care' ? 'rescue' : 'general',
    amount: amount || 0,
    currency: (currency || 'INR').toUpperCase(),
    paymentIntentId: `RZP-${razorpay_payment_id}`,
    isRecurring: false,
    message: message || `${purpose || 'Payment'} completed via Razorpay (${razorpay_payment_id})`,
    status: 'succeeded',
  });

  // Notify user via Socket.io
  const io = req.app.get('io');
  if (io) {
    await notifyUser(io, {
      recipient: req.user._id,
      type: 'donation_success',
      title: 'Payment Successful',
      message: `Your payment of ${donation.currency} ${donation.amount} was confirmed via Razorpay. ID: ${razorpay_payment_id}`,
    }).catch(() => {});
  }

  res.json({
    success: true,
    donation,
    paymentId: razorpay_payment_id,
  });
});

module.exports = {
  createDonation,
  createPosterCarePayment,
  confirmPayment,
  stripeWebhook,
  getDonationHistory,
  getDonationById,
  getDonationAnalytics,
  createRazorpayOrder,
  verifyRazorpayPayment,
};
