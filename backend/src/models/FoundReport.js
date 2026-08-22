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
    species: { type: String, enum: ['dog', 'cat', 'bird', 'other'] },
    status: {
      type: String,
      enum: ['unclaimed', 'matched', 'claimed', 'closed'],
      default: 'unclaimed',
      index: true,
    },
  },
  { timestamps: true }
);

foundReportSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('FoundReport', foundReportSchema);
