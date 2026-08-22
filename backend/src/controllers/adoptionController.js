const asyncHandler = require('express-async-handler');
const Adoption = require('../models/Adoption');
const Pet = require('../models/Pet');
const { notifyUser } = require('../services/notificationService');

// @desc    List a pet as available for adoption (NGO or owner)
// @route   PUT /api/adoption/pets/:petId/list
// @access  Private (ngo, owner, admin)
const listPetForAdoption = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.petId);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  const isOwner = pet.owner.toString() === req.user._id.toString();
  if (!isOwner && !['ngo', 'admin'].includes(req.user.role)) {
    res.status(403);
    throw new Error('Not authorized to list this pet for adoption');
  }

  pet.adoption = {
    isAvailable: true,
    listedBy: req.user._id,
    description: req.body.description || '',
  };
  await pet.save();

  res.json({ success: true, pet });
});

// @desc    Browse pets available for adoption with filters
// @route   GET /api/adoption/pets
// @access  Public/Private
const browseAdoptablePets = asyncHandler(async (req, res) => {
  const { breed, minAge, maxAge, gender, species } = req.query;

  const filter = { 'adoption.isAvailable': true };
  if (breed) filter.breed = new RegExp(breed, 'i');
  if (gender) filter.gender = gender;
  if (species) filter.species = species;
  if (minAge || maxAge) {
    filter.age = {};
    if (minAge) filter.age.$gte = Number(minAge);
    if (maxAge) filter.age.$lte = Number(maxAge);
  }

  const pets = await Pet.find(filter)
    .populate('owner', 'name phone email address')
    .populate('adoption.listedBy', 'name phone email')
    .select('name species breed age gender color images adoption medicalConditions vaccinations weightKg owner lastKnownLocation');

  res.json({ success: true, count: pets.length, pets });
});

// @desc    Apply for adoption
// @route   POST /api/adoption/apply
// @access  Private
const applyForAdoption = asyncHandler(async (req, res) => {
  const { petId, applicationNote } = req.body;

  const pet = await Pet.findById(petId);
  if (!pet || !pet.adoption?.isAvailable) {
    res.status(400);
    throw new Error('This pet is not currently available for adoption');
  }

  const existing = await Adoption.findOne({ pet: petId, applicant: req.user._id, status: { $in: ['pending', 'under_review'] } });
  if (existing) {
    res.status(400);
    throw new Error('You already have a pending application for this pet');
  }

  const adoption = await Adoption.create({
    pet: petId,
    applicant: req.user._id,
    listedByNgo: pet.adoption.listedBy,
    applicationNote,
  });

  if (pet.adoption.listedBy) {
    const io = req.app.get('io');
    await notifyUser(io, {
      recipient: pet.adoption.listedBy,
      type: 'adoption_update',
      title: 'New adoption application',
      message: `${req.user.name} applied to adopt ${pet.name}.`,
      relatedPet: pet._id,
    });
  }

  res.status(201).json({ success: true, adoption });
});

// @desc    List adoption applications (NGO/lister sees applications for their pets, applicant sees own)
// @route   GET /api/adoption
// @access  Private
const getAdoptions = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  if (req.user.role === 'ngo') {
    filter.listedByNgo = req.user._id;
  } else if (req.user.role !== 'admin') {
    filter.applicant = req.user._id;
  }

  const adoptions = await Adoption.find(filter)
    .populate('pet', 'name species breed images')
    .populate('applicant', 'name phone email')
    .sort('-createdAt');

  res.json({ success: true, count: adoptions.length, adoptions });
});

// @desc    Approve or reject an adoption application
// @route   PUT /api/adoption/:id/decision
// @access  Private (ngo who listed the pet, or admin)
const decideAdoption = asyncHandler(async (req, res) => {
  const { decision, decisionNote, homeCheckPassed } = req.body; // decision: 'approved' | 'rejected'

  const adoption = await Adoption.findById(req.params.id);
  if (!adoption) {
    res.status(404);
    throw new Error('Adoption application not found');
  }

  if (adoption.listedByNgo?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to decide this application');
  }

  if (!['approved', 'rejected'].includes(decision)) {
    res.status(400);
    throw new Error('Decision must be "approved" or "rejected"');
  }

  adoption.status = decision;
  adoption.decisionNote = decisionNote;
  if (typeof homeCheckPassed === 'boolean') adoption.homeCheckPassed = homeCheckPassed;

  if (decision === 'approved') {
    adoption.completedAt = new Date();
    await Pet.findByIdAndUpdate(adoption.pet, {
      status: 'adopted',
      owner: adoption.applicant,
      'adoption.isAvailable': false,
    });

    // Reject any other pending applications for the same pet
    await Adoption.updateMany(
      { pet: adoption.pet, _id: { $ne: adoption._id }, status: { $in: ['pending', 'under_review'] } },
      { status: 'rejected', decisionNote: 'Pet has been adopted by another applicant' }
    );
  }

  await adoption.save();

  const io = req.app.get('io');
  await notifyUser(io, {
    recipient: adoption.applicant,
    type: 'adoption_update',
    title: `Adoption application ${decision}`,
    message: decisionNote || `Your adoption application has been ${decision}.`,
    relatedPet: adoption.pet,
  });

  res.json({ success: true, adoption });
});

module.exports = {
  listPetForAdoption,
  browseAdoptablePets,
  applyForAdoption,
  getAdoptions,
  decideAdoption,
};
