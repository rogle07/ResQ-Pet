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

module.exports = mongoose.model('FoundReport', foundReportSchema);
