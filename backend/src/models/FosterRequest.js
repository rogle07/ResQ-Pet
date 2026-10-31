const mongoose = require('mongoose');

const fosterRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, unique: true, sparse: true },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fosterProvider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // Care details
    reason: String,
    petBehavior: String,
    feedingInstructions: String,
    medicalRequirements: String,
    location: String,
    
    // Duration
    durationDays: Number,
    startDate: Date,
    endDate: Date,
    
    // Budget
    budgetAmount: Number,
    budgetCurrency: { type: String, default: 'INR' },
    
    // Agreement flow
    status: {
      type: String,
      enum: [
        'pending',
        'interested',
        'negotiation',
        'awaiting_provider_confirmation',
        'awaiting_owner_confirmation',
        'agreement_completed',
        'payment_pending',
        'payment_completed',
        'active',
        'completed',
        'cancelled',
        'rejected',
        // Legacy statuses for backward compat
        'accepted',
        'in_foster',
      ],
      default: 'pending',
      index: true,
    },
    
    // Agreement tracking
    providerAgreed: { type: Boolean, default: false },
    providerAgreedAt: Date,
    ownerAgreed: { type: Boolean, default: false },
    ownerAgreedAt: Date,
    agreedTerms: {
      duration: Number,
      startDate: Date,
      endDate: Date,
      amount: Number,
      notes: String,
    },
    
    // Payment
    paymentRequired: { type: Boolean, default: false },
    paidAmount: Number,
    paymentId: String,
    paymentStatus: {
      type: String,
      enum: ['not_required', 'pending', 'paid', 'refunded'],
      default: 'not_required',
    },
    
    // Conversation
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    
    // Legacy messages array (keep for backward compat)
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        sentAt: { type: Date, default: Date.now },
      },
    ],
    
    // Documents/photos
    documents: [{ url: String, publicId: String, name: String }],
    
    pickupScheduledAt: Date,
    ownerReturnNotified: { type: Boolean, default: false },
    readyForReturn: { type: Boolean, default: false },
    ownerConfirmed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

fosterRequestSchema.pre('save', function (next) {
  if (!this.requestId) {
    const ts = Date.now().toString(36).toUpperCase();
    this.requestId = `FC-${ts}`;
  }
  next();
});

module.exports = mongoose.model('FosterRequest', fosterRequestSchema);
