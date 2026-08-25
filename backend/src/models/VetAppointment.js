const mongoose = require('mongoose');

const vetAppointmentSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: false,
    },
    petName: {
      type: String,
      required: true,
      trim: true,
    },
    species: {
      type: String,
      enum: ['Dog', 'Cat', 'Goat', 'Cow', 'Rabbit', 'Bird', 'Other'],
      default: 'Dog',
    },
    breed: {
      type: String,
      default: 'Mixed',
    },
    age: {
      type: String,
      default: '1 Year',
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
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
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
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    badgeType: {
      type: String,
      enum: ['Checkup', 'Follow-up', 'Vaccination', 'Emergency', 'Surgery', 'IoT Vitals Review', 'Other'],
      default: 'Checkup',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Upcoming', 'Completed', 'Cancelled', 'In-Progress'],
      default: 'Scheduled',
    },
    collarDeviceId: {
      type: String,
      default: null,
    },
    liveTempC: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VetAppointment', vetAppointmentSchema);
