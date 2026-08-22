const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const petSchema = new mongoose.Schema(
  {
    petId: { type: String, unique: true, default: () => `PET-${uuidv4().split('-')[0].toUpperCase()}` },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    species: { type: String, enum: ['dog', 'cat', 'bird', 'other'], required: true },
    breed: { type: String, trim: true },
    age: { type: Number, min: 0 },
    gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    color: { type: String, trim: true },
    weightKg: { type: Number, min: 0 },
    images: [{ url: String, publicId: String }],
    qrCode: { type: String },

    vaccinations: [
      {
        name: String,
        dateGiven: Date,
        nextDueDate: Date,
        administeredBy: String,
      },
    ],
    medicalConditions: [
      {
        condition: String,
        diagnosedDate: Date,
        notes: String,
      },
    ],

    collar: {
      deviceId: { type: String, index: true, sparse: true },
      isActive: { type: Boolean, default: false },
      lastBatteryPercent: Number,
      lastSeenAt: Date,
    },

    safeZone: {
      enabled: { type: Boolean, default: false },
      center: { lat: Number, lng: Number },
      radiusMeters: { type: Number, default: 200 },
    },

    status: {
      type: String,
      enum: ['safe', 'lost', 'found', 'in_rescue', 'in_foster', 'adopted'],
      default: 'safe',
      index: true,
    },

    adoption: {
      isAvailable: { type: Boolean, default: false },
      listedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      description: String,
    },

    lastKnownLocation: {
      lat: Number,
      lng: Number,
      updatedAt: Date,
    },
  },
  { timestamps: true }
);

petSchema.index({ 'lastKnownLocation.lat': 1, 'lastKnownLocation.lng': 1 });
petSchema.index({ name: 'text', breed: 'text', color: 'text' });

module.exports = mongoose.model('Pet', petSchema);
