const mongoose = require('mongoose');

const lostPetReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
    },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    petName: { type: String, required: true, trim: true },
    animalType: { type: String, required: true },
    breed: { type: String, trim: true },
    age: { type: String, trim: true },
    gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    color: { type: String, trim: true },
    distinctiveMarks: { type: String, trim: true },
    bodySize: { type: String, trim: true },
    collarDetails: { type: String, trim: true },
    lastKnownLocation: {
      address: String,
      lat: Number,
      lng: Number,
    },
    lastSeenDate: { type: Date, required: true },
    lastSeenTime: { type: String },
    description: { type: String, trim: true },
    additionalInfo: { type: String, trim: true },
    photos: [{ url: String, publicId: String }],
    contactPhone: { type: String, trim: true },
    status: {
      type: String,
      enum: ['missing', 'searching', 'potential_match_found', 'verification_pending', 'reunited', 'closed'],
      default: 'missing',
      index: true,
    },
    matchedFoundReport: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundReport', default: null },
    matchScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

lostPetReportSchema.index({ 'lastKnownLocation.lat': 1, 'lastKnownLocation.lng': 1 });
lostPetReportSchema.index({ animalType: 1, status: 1 });

lostPetReportSchema.pre('save', function (next) {
  if (!this.reportId) {
    const ts = Date.now().toString(36).toUpperCase();
    this.reportId = `LP-${ts}`;
  }
  next();
});

module.exports = mongoose.model('LostPetReport', lostPetReportSchema);
