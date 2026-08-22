const mongoose = require('mongoose');

const fosterRequestSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fosterProvider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    durationDays: Number,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    pickupScheduledAt: Date,
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        sentAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('FosterRequest', fosterRequestSchema);
