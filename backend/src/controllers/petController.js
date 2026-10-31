const asyncHandler = require('express-async-handler');
const QRCode = require('qrcode');
const Pet = require('../models/Pet');
const { uploadFilesToCloudinary, deleteFromCloudinary } = require('../middleware/upload');
const { notifyUser, broadcastToRescueTeams } = require('../services/notificationService');

// @desc    Create a new pet profile
// @route   POST /api/pets
// @access  Private (owner)
const createPet = asyncHandler(async (req, res) => {
  const { name, species, breed, age, gender, color, weightKg, distinctiveMarks } = req.body;

  const pet = await Pet.create({
    owner: req.user._id,
    name,
    species,
    breed,
    age: age !== undefined && age !== '' ? Number(age) : undefined,
    gender: gender || 'unknown',
    color,
    weightKg: weightKg !== undefined && weightKg !== '' ? Number(weightKg) : undefined,
  });

  // Generate a QR code that encodes the pet's public profile URL
  try {
    const clientBase = process.env.CLIENT_URL || 'https://res-q-pet-51cc.vercel.app';
    const profileUrl = `${clientBase}/pets/public/${pet.petId}`;
    const qrDataUrl = await QRCode.toDataURL(profileUrl);
    pet.qrCode = qrDataUrl;
  } catch (qrErr) {
    console.error('QR code generation error:', qrErr.message);
  }

  if (req.files?.length) {
    try {
      pet.images = await uploadFilesToCloudinary(req.files, 'pets');
    } catch (uploadErr) {
      console.error('Image upload failed, continuing without images:', uploadErr.message);
    }
  }

  await pet.save();

  res.status(201).json({ success: true, pet });
});

// @desc    Get all pets belonging to the logged-in owner
// @route   GET /api/pets
// @access  Private (owner)
const getMyPets = asyncHandler(async (req, res) => {
  const pets = await Pet.find({ owner: req.user._id }).sort('-createdAt');
  res.json({ success: true, count: pets.length, pets });
});

// @desc    Get single pet by ID (owner or authorized roles)
// @route   GET /api/pets/:id
// @access  Private
const getPetById = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id).populate('owner', 'name email phone');

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  const isOwner = pet.owner?._id
    ? pet.owner._id.toString() === req.user._id.toString()
    : pet.owner?.toString() === req.user._id.toString();
  const privilegedRoles = ['admin', 'rescue_team', 'ngo', 'veterinarian'];

  if (!isOwner && !privilegedRoles.includes(req.user.role)) {
    res.status(403);
    throw new Error('Not authorized to view this pet');
  }

  res.json({ success: true, pet });
});

// @desc    Get a pet's public profile (no auth) - used by QR code scan
// @route   GET /api/pets/public/:petId
// @access  Public
const getPublicPetProfile = asyncHandler(async (req, res) => {
  const pet = await Pet.findOne({ petId: req.params.petId }).populate('owner', 'name phone');

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  res.json({
    success: true,
    pet: {
      petId: pet.petId,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      images: pet.images,
      status: pet.status,
      ownerContact: { name: pet.owner.name, phone: pet.owner.phone },
    },
  });
});

// @desc    Update pet profile
// @route   PUT /api/pets/:id
// @access  Private (owner)
const updatePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  if (pet.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this pet');
  }

  const updatableFields = ['name', 'species', 'breed', 'age', 'gender', 'color', 'weightKg', 'distinctiveMarks'];
  updatableFields.forEach((field) => {
    if (req.body[field] !== undefined) pet[field] = req.body[field];
  });

  if (req.files?.length) {
    const newImages = await uploadFilesToCloudinary(req.files, 'pets');
    pet.images.push(...newImages);
  }

  await pet.save();
  res.json({ success: true, pet });
});

// @desc    Delete pet
// @route   DELETE /api/pets/:id
// @access  Private (owner)
const deletePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }

  if (pet.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this pet');
  }

  await Promise.all(pet.images.map((img) => deleteFromCloudinary(img.publicId)));
  await pet.deleteOne();

  res.json({ success: true, message: 'Pet deleted successfully' });
});

// @desc    Add / update vaccination record
// @route   POST /api/pets/:id/vaccinations
// @access  Private (owner)
const addVaccination = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }
  if (pet.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const { name, dateGiven, nextDueDate, administeredBy } = req.body;
  pet.vaccinations.push({ name, dateGiven, nextDueDate, administeredBy });
  await pet.save();

  res.status(201).json({ success: true, vaccinations: pet.vaccinations });
});

// @desc    Set or update a pet's geo-fence safe zone
// @route   PUT /api/pets/:id/safe-zone
// @access  Private (owner)
const setSafeZone = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }
  if (pet.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const { enabled, lat, lng, radiusMeters } = req.body;
  pet.safeZone = {
    enabled: enabled ?? pet.safeZone.enabled,
    center: { lat, lng },
    radiusMeters: radiusMeters || pet.safeZone.radiusMeters || 200,
  };
  await pet.save();

  res.json({ success: true, safeZone: pet.safeZone });
});

// @desc    Mark pet as lost - triggers rescue-team visibility + notifications
// @route   POST /api/pets/:id/mark-lost
// @access  Private (owner)
const markPetLost = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }
  if (pet.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  pet.status = 'lost';
  await pet.save();

  const io = req.app.get('io');
  broadcastToRescueTeams(io, 'pet:lost', {
    petId: pet._id,
    name: pet.name,
    lastKnownLocation: pet.lastKnownLocation,
  });

  res.json({ success: true, pet });
});

// @desc    Mark pet as safe / found (owner confirms recovery)
// @route   POST /api/pets/:id/mark-safe
// @access  Private (owner)
const markPetSafe = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }
  if (pet.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  pet.status = 'safe';
  await pet.save();

  res.json({ success: true, pet });
});


// @desc    Get public pet profile by ResQTag ID
// @route   GET /api/pets/public-tag/:tagId
// @access  Public
const getPublicTag = asyncHandler(async (req, res) => {
  const pet = await Pet.findOne({ tagId: req.params.tagId })
    .populate('owner', 'name phone email');

  if (!pet) {
    res.status(404);
    throw new Error('ResQTag not found or not registered');
  }

  if (!pet.resqTag || !pet.resqTag.isActive) {
    res.status(404);
    throw new Error('This ResQTag is not active');
  }

  res.json({
    success: true,
    pet: {
      _id: pet._id,
      tagId: pet.tagId,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      color: pet.color,
      gender: pet.gender,
      distinctiveMarks: pet.distinctiveMarks,
      photos: pet.images,
      owner: {
        name: pet.owner.name,
        phone: pet.resqTag.showPhone ? pet.owner.phone : null,
        showPhone: pet.resqTag.showPhone,
      },
    },
  });
});

// @desc    Contact pet owner via ResQTag (sends notification)
// @route   POST /api/pets/public-tag/:tagId/contact
// @access  Public
const contactOwnerViaTag = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const pet = await Pet.findOne({ tagId: req.params.tagId })
    .populate('owner', 'name email');

  if (!pet) {
    res.status(404);
    throw new Error('ResQTag not found');
  }

  // Create a notification for the owner
  const Notification = require('../models/Notification');
  await Notification.create({
    user: pet.owner._id,
    title: 'Someone found your pet!',
    message: `A person found your pet "${pet.name}" and sent a message: "${message}"`,
    type: 'found_pet',
  });

  res.json({ success: true, message: 'Message sent to owner' });
});

// @desc    Report pet found via ResQTag
// @route   POST /api/pets/public-tag/:tagId/report-found
// @access  Public
const reportFoundViaTag = asyncHandler(async (req, res) => {
  const pet = await Pet.findOne({ tagId: req.params.tagId })
    .populate('owner', 'name email');

  if (!pet) {
    res.status(404);
    throw new Error('ResQTag not found');
  }

  const Notification = require('../models/Notification');
  await Notification.create({
    user: pet.owner._id,
    title: 'Your pet was scanned!',
    message: `Someone scanned your pet "${pet.name}"'s ResQTag. They may have found your pet.`,
    type: 'pet_scanned',
  });

  res.json({ success: true, message: 'Report sent to owner' });
});

// @desc    Generate/activate ResQTag for a pet
// @route   POST /api/pets/:id/generate-tag
// @access  Private (owner)
const generateResQTag = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }
  if (pet.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Generate a unique tag ID if not already assigned
  if (!pet.tagId) {
    const { v4: uuidv4 } = require('uuid');
    pet.tagId = `RQ-${uuidv4().split('-')[0].toUpperCase()}`;
  }
  pet.resqTag = {
    isActive: true,
    showPhone: req.body.showPhone || false,
    showEmail: req.body.showEmail || false,
    generatedAt: new Date(),
  };

  const clientBase = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://resqpet.vercel.app';
  const tagUrl = `${clientBase}/tag/${pet.tagId}`;

  try {
    const qrDataUrl = await QRCode.toDataURL(tagUrl);
    pet.qrCode = qrDataUrl;
  } catch (qrErr) {
    console.error('ResQTag QR code generation error:', qrErr.message);
  }

  await pet.save();

  res.json({
    success: true,
    tagId: pet.tagId,
    tagUrl,
    qrCode: pet.qrCode,
    pet,
  });
});

module.exports = {
  createPet,
  getMyPets,
  getPetById,
  getPublicPetProfile,
  updatePet,
  deletePet,
  addVaccination,
  setSafeZone,
  markPetLost,
  markPetSafe,
  getPublicTag,
  contactOwnerViaTag,
  reportFoundViaTag,
  generateResQTag,
};
