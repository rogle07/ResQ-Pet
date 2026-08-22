const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listedByNgo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    applicationNote: String,
    homeCheckPassed: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'completed'],
      default: 'pending',
      index: true,
    },
    decisionNote: String,
    completedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Adoption', adoptionSchema);
