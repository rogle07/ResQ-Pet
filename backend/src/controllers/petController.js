const asyncHandler = require('express-async-handler');
const QRCode = require('qrcode');
const Pet = require('../models/Pet');
const { uploadFilesToCloudinary, deleteFromCloudinary } = require('../middleware/upload');
const { notifyUser, broadcastToRescueTeams } = require('../services/notificationService');
const { v4: uuidv4 } = require('uuid');

// Helper to generate high-res PNG and vector SVG for QR tags
const generateQrData = async (scanUrl) => {
  const qrCode = await QRCode.toDataURL(scanUrl, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    quality: 1.0,
    margin: 2,
    width: 600,
    color: { dark: '#000000', light: '#ffffff' },
  });
  const qrCodeSvg = await QRCode.toString(scanUrl, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });
  return { qrCode, qrCodeSvg };
};

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

  // Generate permanent tagId & high-contrast QR assets
  if (!pet.tagId) {
    pet.tagId = `RQP-${uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  }
  pet.resqTag = {
    isActive: true,
    showPhone: false,
    enableCall: true,
    enableWhatsApp: true,
    showLocation: false,
    showEmail: false,
    generatedAt: new Date(),
  };

  try {
    const clientBase = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'https://res-q-pet-51cc.vercel.app';
    const scanUrl = `${clientBase}/pet/scan/${pet.tagId}`;
    const { qrCode, qrCodeSvg } = await generateQrData(scanUrl);
    pet.qrCode = qrCode;
    pet.qrCodeSvg = qrCodeSvg;
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

  // Ensure permanent tagId and QR assets exist
  let modified = false;
  if (!pet.tagId) {
    pet.tagId = `RQP-${uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    modified = true;
  }
  if (!pet.resqTag) {
    pet.resqTag = {
      isActive: true,
      showPhone: false,
      enableCall: true,
      enableWhatsApp: true,
      showLocation: false,
      showEmail: false,
      generatedAt: new Date(),
    };
    modified = true;
  }
  if (!pet.qrCode || !pet.qrCodeSvg) {
    try {
      const clientBase = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'https://res-q-pet-51cc.vercel.app';
      const scanUrl = `${clientBase}/pet/scan/${pet.tagId}`;
      const { qrCode, qrCodeSvg } = await generateQrData(scanUrl);
      pet.qrCode = qrCode;
      pet.qrCodeSvg = qrCodeSvg;
      modified = true;
    } catch (qrErr) {
      console.error('QR generation fallback error:', qrErr.message);
    }
  }

  if (modified) {
    await pet.save();
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

  const updatableFields = ['name', 'species', 'breed', 'age', 'gender', 'color', 'weightKg', 'distinctiveMarks', 'description'];
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


// @desc    Get public pet profile by ResQTag ID / publicPetId (no auth required)
// @route   GET /api/pets/public-tag/:tagId or /api/pets/scan/:tagId
// @access  Public
const getPublicTag = asyncHandler(async (req, res) => {
  const identifier = req.params.tagId || req.params.publicPetId || req.params.id;

  const query = {
    $or: [
      { tagId: identifier },
      { petId: identifier },
    ],
  };

  const mongoose = require('mongoose');
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    query.$or.push({ _id: identifier });
  }

  const pet = await Pet.findOne(query).populate('owner', 'name phone email');

  if (!pet) {
    res.status(404);
    throw new Error('Pet tag not found or unregistered');
  }

  const owner = pet.owner || {};
  const showPhone = !!pet.resqTag?.showPhone;
  const enableCall = pet.resqTag?.enableCall !== false && !!owner.phone;
  const enableWhatsApp = pet.resqTag?.enableWhatsApp !== false && !!owner.phone;

  let cleanPhone = null;
  if (owner.phone) {
    cleanPhone = String(owner.phone).replace(/[^0-9+]/g, '');
  }

  // Last known location only if owner explicitly enabled public location sharing
  let publicLocation = null;
  if (pet.resqTag?.showLocation && pet.lastKnownLocation?.lat && pet.lastKnownLocation?.lng) {
    publicLocation = {
      lat: pet.lastKnownLocation.lat,
      lng: pet.lastKnownLocation.lng,
      updatedAt: pet.lastKnownLocation.updatedAt || pet.updatedAt,
    };
  }

  res.json({
    success: true,
    pet: {
      _id: pet._id,
      tagId: pet.tagId || pet.petId,
      petId: pet.petId,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      color: pet.color,
      gender: pet.gender,
      age: pet.age,
      description: pet.description || pet.distinctiveMarks,
      distinctiveMarks: pet.distinctiveMarks,
      photos: pet.images,
      status: pet.status,
      lastKnownLocation: publicLocation,
      customInstructions: pet.resqTag?.customInstructions || null,
      owner: {
        name: owner.name || 'Pet Owner',
        phone: showPhone ? owner.phone : null,
        showPhone,
        enableCall,
        enableWhatsApp,
        callUri: enableCall ? `tel:${cleanPhone}` : null,
        whatsappUri: enableWhatsApp
          ? `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(
              `Hello ${owner.name || ''}, I found your pet "${pet.name}" (Tag: ${pet.tagId || pet.petId}) registered on ResQPet.`
            )}`
          : null,
      },
      resqTag: {
        isActive: pet.resqTag?.isActive !== false,
      },
    },
  });
});

// @desc    Contact pet owner via ResQTag (delivers real-time notification to owner)
// @route   POST /api/pets/public-tag/:tagId/contact
// @access  Public
const contactOwnerViaTag = asyncHandler(async (req, res) => {
  const identifier = req.params.tagId;
  const { message, finderName, finderPhone } = req.body;

  if (!message || !message.trim()) {
    res.status(400);
    throw new Error('Message is required');
  }

  const query = {
    $or: [{ tagId: identifier }, { petId: identifier }],
  };
  const mongoose = require('mongoose');
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    query.$or.push({ _id: identifier });
  }

  const pet = await Pet.findOne(query).populate('owner', 'name email');
  if (!pet) {
    res.status(404);
    throw new Error('Pet tag not found');
  }

  const io = req.app.get('io');
  const contactInfo = finderPhone ? ` (Finder Contact: ${finderPhone}${finderName ? ', ' + finderName : ''})` : '';

  await notifyUser(io, {
    recipient: pet.owner._id,
    type: 'pet_found',
    title: `🚨 Urgent Message Regarding ${pet.name}!`,
    message: `A finder scanned ${pet.name}'s tag and sent: "${message.trim()}"${contactInfo}`,
    relatedPet: pet._id,
  });

  res.json({ success: true, message: 'Message delivered to pet owner successfully' });
});

// @desc    Report pet found via ResQTag with optional GPS coordinates
// @route   POST /api/pets/public-tag/:tagId/report-found
// @access  Public
const reportFoundViaTag = asyncHandler(async (req, res) => {
  const identifier = req.params.tagId;
  const { latitude, longitude, accuracy, note, finderPhone, finderName } = req.body;

  const query = {
    $or: [{ tagId: identifier }, { petId: identifier }],
  };
  const mongoose = require('mongoose');
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    query.$or.push({ _id: identifier });
  }

  const pet = await Pet.findOne(query).populate('owner', 'name email');
  if (!pet) {
    res.status(404);
    throw new Error('Pet tag not found');
  }

  const io = req.app.get('io');

  let locationText = '';
  if (latitude && longitude) {
    const latNum = Number(latitude);
    const lngNum = Number(longitude);
    if (!isNaN(latNum) && !isNaN(lngNum) && (latNum !== 0 || lngNum !== 0)) {
      const mapsUrl = `https://maps.google.com/?q=${latNum},${lngNum}`;
      locationText = ` 📍 GPS Location: ${latNum.toFixed(6)}, ${lngNum.toFixed(6)} (Map: ${mapsUrl})`;

      pet.lastKnownLocation = {
        lat: latNum,
        lng: lngNum,
        updatedAt: new Date(),
      };
      await pet.save();
    }
  }

  const finderDetails = finderPhone ? ` Finder Phone: ${finderPhone}${finderName ? ' (' + finderName + ')' : ''}.` : '';
  const noteDetails = note ? ` Message: "${note.trim()}".` : '';

  await notifyUser(io, {
    recipient: pet.owner._id,
    type: 'pet_found',
    title: `🔔 FOUND PET REPORT: ${pet.name.toUpperCase()}!`,
    message: `Someone reported finding ${pet.name}!${locationText}${finderDetails}${noteDetails}`,
    relatedPet: pet._id,
  });

  res.json({
    success: true,
    message: 'Found report delivered to owner with your location. Thank you!',
  });
});

// @desc    Generate / update ResQTag for a pet
// @route   POST /api/pets/:id/generate-tag
// @access  Private (owner)
const generateResQTag = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }
  if (pet.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const { showPhone, enableCall, enableWhatsApp, showLocation, customInstructions, regenerate } = req.body;

  // Only regenerate tagId if explicitly requested
  if (regenerate || !pet.tagId) {
    pet.tagId = `RQP-${uuidv4().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  }

  pet.resqTag = {
    isActive: true,
    showPhone: showPhone !== undefined ? !!showPhone : (pet.resqTag?.showPhone ?? false),
    enableCall: enableCall !== undefined ? !!enableCall : (pet.resqTag?.enableCall ?? true),
    enableWhatsApp: enableWhatsApp !== undefined ? !!enableWhatsApp : (pet.resqTag?.enableWhatsApp ?? true),
    showLocation: showLocation !== undefined ? !!showLocation : (pet.resqTag?.showLocation ?? false),
    showEmail: false,
    customInstructions: customInstructions !== undefined ? customInstructions : (pet.resqTag?.customInstructions || ''),
    generatedAt: new Date(),
  };

  const clientBase = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'https://res-q-pet-51cc.vercel.app';
  const scanUrl = `${clientBase}/pet/scan/${pet.tagId}`;

  try {
    const { qrCode, qrCodeSvg } = await generateQrData(scanUrl);
    pet.qrCode = qrCode;
    pet.qrCodeSvg = qrCodeSvg;
  } catch (qrErr) {
    console.error('ResQTag QR code generation error:', qrErr.message);
  }

  await pet.save();

  res.json({
    success: true,
    tagId: pet.tagId,
    scanUrl,
    tagUrl: scanUrl,
    qrCode: pet.qrCode,
    qrCodeSvg: pet.qrCodeSvg,
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
