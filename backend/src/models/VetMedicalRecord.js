const mongoose = require('mongoose');

const medicationItemSchema = new mongoose.Schema({
  medicine: { type: String, required: true },
  dosage: { type: String, required: true },
  duration: { type: String, required: true },
  instructions: { type: String, default: '' },
});

const vetMedicalRecordSchema = new mongoose.Schema(
  {
    recordId: {
      type: String,
      required: true,
      unique: true,
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
    petCode: {
      type: String,
      default: '',
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
    gender: {
      type: String,
      enum: ['Male', 'Female'],
      default: 'Male',
    },
    image: {
      type: String,
      default: '/animal-dog.jpg',
    },
    ownerName: {
      type: String,
      required: true,
    },
    ownerPhone: {
      type: String,
      required: true,
    },
    ownerEmail: {
      type: String,
      default: '',
    },
    date: {
      type: String,
      required: true,
    },
    attendingVet: {
      type: String,
      default: 'Dr. Neeraj Sharma',
    },
    diagnosis: {
      type: String,
      required: true,
    },
    symptoms: [{ type: String }],
    treatmentPlan: [{ type: String }],
    medications: [medicationItemSchema],
    notes: {
      type: String,
      default: '',
    },
    attachments: [
      {
        name: { type: String },
        size: { type: String },
        type: { type: String, default: 'image' },
        url: { type: String },
      },
    ],
    nextAppointmentDate: {
      type: String,
      default: '',
    },
    nextAppointmentTime: {
      type: String,
      default: '',
    },
    emergencyContact: {
      type: String,
      default: '+91 9695609898',
    },
    iotTelemetrySnapshot: {
      collarId: { type: String },
      temperatureC: { type: Number },
      motionLevel: { type: String },
      batteryPercent: { type: Number },
      gpsLocation: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VetMedicalRecord', vetMedicalRecordSchema);
