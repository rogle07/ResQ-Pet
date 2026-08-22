const mongoose = require('mongoose');

const rescueRequestSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['emergency', 'lost_pet', 'injured_animal', 'stray'], required: true },
    description: String,
    photos: [{ url: String, publicId: String }],
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: String,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    timeline: [
      {
        status: String,
        note: String,
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now },
      },
    ],
    closedAt: Date,
  },
  { timestamps: true }
);

rescueRequestSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('RescueRequest', rescueRequestSchema);
