const mongoose = require('mongoose');

const foundReportSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matchedPet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', default: null },
    photos: [{ url: String, publicId: String }],
    description: { type: String, required: true },
    contactPhone: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: String,
    },
    foundAt: { type: Date, required: true },
    timeFound: String,
    species: { type: String, default: 'dog' },
    breed: String,
    approximateAge: String,
    gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    currentPetLocation: String,
    condition: String,
    additionalNotes: String,
    reportId: { type: String, unique: true, sparse: true },
    color: { type: String, trim: true },
    distinctiveMarks: { type: String, trim: true },
    bodySize: { type: String, trim: true },
    collarDetails: { type: String, trim: true },
    isInjured: { type: Boolean, default: false },
    assistanceRequested: {
      type: String,
      enum: ['none', 'rescue_team', 'ngo_shelter'],
      default: 'none',
    },
    matchedLostReport: { type: mongoose.Schema.Types.ObjectId, ref: 'LostPetReport', default: null },
    matchScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        'pending',
        'under_review',
        'owner_match_found',
        'rescue_assigned',
        'reunited',
        'closed',
        'unclaimed',
        'matched',
        'claimed',
      ],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

foundReportSchema.index({ 'location.lat': 1, 'location.lng': 1 });

foundReportSchema.pre('save', function (next) {
  if (!this.reportId) {
    const ts = Date.now().toString(36).toUpperCase();
    this.reportId = `FP-${ts}`;
  }
  next();
});

module.exports = mongoose.model('FoundReport', foundReportSchema);
