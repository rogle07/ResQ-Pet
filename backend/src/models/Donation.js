const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['one_time', 'monthly', 'food', 'medicine', 'rescue'], required: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'USD' },
    paymentProvider: { type: String, default: 'stripe' },
    paymentIntentId: String,
    status: { type: String, enum: ['pending', 'succeeded', 'failed', 'refunded'], default: 'pending', index: true },
    isRecurring: { type: Boolean, default: false },
    message: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', donationSchema);
