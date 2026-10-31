const mongoose = require('mongoose');

// Adoption Listing - a pet listed for adoption
const adoptionListingSchema = new mongoose.Schema(
  {
    listingId: { type: String, unique: true, sparse: true },
    listedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' }, // optional - can be an unregistered pet
    
    // Pet details (for pets not registered in system)
    petName: { type: String, required: true },
    animalType: { type: String, required: true },
    breed: String,
    age: String,
    gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    healthCondition: String,
    vaccinationInfo: String,
    behavior: String,
    photos: [{ url: String, publicId: String }],
    location: String,
    description: String,
    adoptionTerms: String,
    adoptionFee: { type: Number, default: 0 },
    isFree: { type: Boolean, default: true },
    
    status: {
      type: String,
      enum: ['available', 'pending', 'adopted', 'withdrawn'],
      default: 'available',
      index: true,
    },
  },
  { timestamps: true }
);

adoptionListingSchema.pre('save', function (next) {
  if (!this.listingId) {
    const ts = Date.now().toString(36).toUpperCase();
    this.listingId = `AL-${ts}`;
  }
  if (this.adoptionFee === 0) this.isFree = true;
  next();
});

const AdoptionListing = mongoose.model('AdoptionListing', adoptionListingSchema);

// Adoption Request - someone applies to adopt a listed pet
const adoptionRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, unique: true, sparse: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'AdoptionListing', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listingOwner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicationNote: String,
    
    status: {
      type: String,
      enum: [
        'pending',
        'under_review',
        'negotiation',
        'awaiting_owner_confirmation',
        'awaiting_adopter_confirmation',
        'agreement_completed',
        'payment_pending',
        'payment_completed',
        'handover_pending',
        'completed',
        'rejected',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },
    
    // Agreement
    ownerAgreed: { type: Boolean, default: false },
    applicantAgreed: { type: Boolean, default: false },
    agreedFee: { type: Number, default: 0 },
    
    // Payment
    paymentRequired: { type: Boolean, default: false },
    paymentId: String,
    paymentStatus: {
      type: String,
      enum: ['not_required', 'pending', 'paid'],
      default: 'not_required',
    },
    
    // Conversation
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    
    decisionNote: String,
    completedAt: Date,
  },
  { timestamps: true }
);

adoptionRequestSchema.pre('save', function (next) {
  if (!this.requestId) {
    const ts = Date.now().toString(36).toUpperCase();
    this.requestId = `AR-${ts}`;
  }
  next();
});

const AdoptionRequest = mongoose.model('AdoptionRequest', adoptionRequestSchema);

// Legacy model kept for backward compat
const adoptionSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listedByNgo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    applicationNote: String,
    homeCheckPassed: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'completed'],
      default: 'pending',
      index: true,
    },
    decisionNote: String,
    completedAt: Date,
  },
  { timestamps: true }
);

const Adoption = mongoose.model('Adoption', adoptionSchema);

module.exports = { Adoption, AdoptionListing, AdoptionRequest };
