const mongoose = require('mongoose');

const vetPrescriptionSchema = new mongoose.Schema(
  {
    prescriptionNumber: {
      type: String,
      required: true,
      unique: true,
    },
    date: {
      type: String,
      required: true,
    },
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: false,
    },
    petName: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
      default: 'Dr. Neeraj Sharma (BVSc & AH, MVSc)',
    },
    diagnosis: {
      type: String,
      required: true,
    },
    medications: [
      {
        medicine: { type: String, required: true },
        dosage: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: { type: String, default: '' },
      },
    ],
    instructions: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VetPrescription', vetPrescriptionSchema);
