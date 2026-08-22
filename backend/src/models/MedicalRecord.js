const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true, index: true },
    veterinarian: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    visitDate: { type: Date, default: Date.now },
    diagnosis: String,
    treatment: String,
    prescriptions: [{ name: String, dosage: String, durationDays: Number }],
    attachments: [{ url: String, publicId: String }],
    notes: String,
    followUpDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
