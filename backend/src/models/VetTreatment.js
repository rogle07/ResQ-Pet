const mongoose = require('mongoose');

const vetTreatmentSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: false,
    },
    petName: {
      type: String,
      required: true,
    },
    species: {
      type: String,
      default: 'Dog',
    },
    breed: {
      type: String,
      default: '',
    },
    age: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '/animal-dog.jpg',
    },
    condition: {
      type: String,
      required: true,
    },
    treatmentName: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Ongoing', 'Completed'],
      default: 'Ongoing',
    },
    attendingVet: {
      type: String,
      default: 'Dr. Neeraj Sharma',
    },
    progressNotes: {
      type: String,
      default: '',
    },
    collarMonitored: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VetTreatment', vetTreatmentSchema);
