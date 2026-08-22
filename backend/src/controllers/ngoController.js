const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Pet = require('../models/Pet');
const MedicalRecord = require('../models/MedicalRecord');
const Adoption = require('../models/Adoption');
const RescueRequest = require('../models/RescueRequest');
const Donation = require('../models/Donation');

// @desc    Public directory of verified NGOs (for donation/adoption pages)
// @route   GET /api/ngo/directory
// @access  Public
const getNgoDirectory = asyncHandler(async (req, res) => {
  const ngos = await User.find({ role: 'ngo', 'ngoDetails.verified': true, isActive: true }).select(
    'name email phone address ngoDetails avatar'
  );
  res.json({ success: true, count: ngos.length, ngos });
});

// @desc    NGO dashboard summary - animals, adoptions, rescues, donations at a glance
// @route   GET /api/ngo/dashboard
// @access  Private (ngo)
const getNgoDashboard = asyncHandler(async (req, res) => {
  const [animalsManaged, pendingAdoptions, activeRescues, donationTotal] = await Promise.all([
    Pet.countDocuments({ 'adoption.listedBy': req.user._id }),
    Adoption.countDocuments({ listedByNgo: req.user._id, status: { $in: ['pending', 'under_review'] } }),
    RescueRequest.countDocuments({ assignedTeam: req.user._id, status: { $in: ['accepted', 'in_progress'] } }),
    Donation.aggregate([
      { $match: { ngo: req.user._id, status: 'succeeded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  res.json({
    success: true,
    summary: {
      animalsManaged,
      pendingAdoptions,
      activeRescues,
      totalDonations: donationTotal[0]?.total || 0,
    },
  });
});

// @desc    Add a medical record for a pet under NGO/vet care
// @route   POST /api/ngo/medical-records
// @access  Private (ngo, veterinarian, admin)
const addMedicalRecord = asyncHandler(async (req, res) => {
  const { petId, diagnosis, treatment, prescriptions, notes, followUpDate } = req.body;

  const pet = await Pet.findById(petId);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  const record = await MedicalRecord.create({
    pet: petId,
    veterinarian: req.user.role === 'veterinarian' ? req.user._id : undefined,
    diagnosis,
    treatment,
    prescriptions,
    notes,
    followUpDate,
  });

  res.status(201).json({ success: true, record });
});

// @desc    Get medical history for a pet
// @route   GET /api/ngo/medical-records/:petId
// @access  Private (owner, ngo, veterinarian, admin)
const getMedicalRecords = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.petId);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  const isOwner = pet.owner.toString() === req.user._id.toString();
  const privileged = ['ngo', 'veterinarian', 'admin'].includes(req.user.role);
  if (!isOwner && !privileged) {
    res.status(403);
    throw new Error('Not authorized to view medical records');
  }

  const records = await MedicalRecord.find({ pet: req.params.petId })
    .populate('veterinarian', 'name veterinarianDetails')
    .sort('-visitDate');

  res.json({ success: true, count: records.length, records });
});

module.exports = { getNgoDirectory, getNgoDashboard, addMedicalRecord, getMedicalRecords };
