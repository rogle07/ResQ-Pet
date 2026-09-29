const asyncHandler = require('express-async-handler');
const FoundReport = require('../models/FoundReport');
const RescueRequest = require('../models/RescueRequest');
const Pet = require('../models/Pet');
const { uploadFilesToCloudinary } = require('../middleware/upload');
const { notifyUser, broadcastToRescueTeams } = require('../services/notificationService');
const { distanceInMeters } = require('../utils/geoUtils');

const MATCH_RADIUS_METERS = 5000; // consider lost pets within 5km as possible matches

// @desc    Submit a found-pet report
// @route   POST /api/found-reports
// @access  Private (finder or any authenticated user)
// @desc    Submit a found-pet report
// @route   POST /api/found-reports
// @access  Private (finder, found_pet_reporter or any authenticated user)
const createFoundReport = asyncHandler(async (req, res) => {
  const {
    description,
    contactPhone,
    lat,
    lng,
    address,
    foundAt,
    timeFound,
    species,
    breed,
    approximateAge,
    gender,
    currentPetLocation,
    condition,
    additionalNotes,
    requestRescue,
    pickupAddress,
  } = req.body;

  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  const report = await FoundReport.create({
    reportedBy: req.user._id,
    description,
    contactPhone,
    location: {
      lat: !isNaN(parsedLat) ? parsedLat : 28.6139,
      lng: !isNaN(parsedLng) ? parsedLng : 77.2090,
      address: address || '',
    },
    foundAt: foundAt || new Date(),
    timeFound: timeFound || '',
    species: species || 'dog',
    breed: breed || '',
    approximateAge: approximateAge || '',
    gender: gender || 'unknown',
    currentPetLocation: currentPetLocation || '',
    condition: condition || 'Healthy',
    additionalNotes: additionalNotes || '',
    status: 'pending',
    photos: req.files?.length ? await uploadFilesToCloudinary(req.files, 'found-reports') : [],
  });

  // Best-effort proximity match against currently-lost pets of the same species
  const lostPets = await Pet.find({ status: 'lost', species: species || { $exists: true } }).limit(200);
  const possibleMatches = lostPets
    .filter((pet) => pet.lastKnownLocation?.lat && pet.lastKnownLocation?.lng)
    .map((pet) => ({
      pet,
      distance: distanceInMeters(report.location.lat, report.location.lng, pet.lastKnownLocation.lat, pet.lastKnownLocation.lng),
    }))
    .filter((m) => m.distance <= MATCH_RADIUS_METERS)
    .sort((a, b) => a.distance - b.distance);

  const io = req.app.get('io');

  if (possibleMatches.length > 0) {
    report.matchedPet = possibleMatches[0].pet._id;
    report.status = 'owner_match_found';
    await report.save();

    // Notify owners of the top 3 closest candidates so they can verify
    await Promise.all(
      possibleMatches.slice(0, 3).map((m) =>
        notifyUser(io, {
          recipient: m.pet.owner,
          type: 'pet_found',
          title: 'A pet matching your lost pet was found nearby',
          message: `A community member reported a ${species || 'pet'} found near your pet's last known location. Please review the report.`,
          relatedPet: m.pet._id,
        })
      )
    );
  }

  // If the reporter requested rescue team pickup, create a RescueRequest automatically
  let rescueRequest = null;
  if (requestRescue === 'true' || requestRescue === true) {
    rescueRequest = await RescueRequest.create({
      requestedBy: req.user._id,
      type: 'stray',
      description: `Found pet reported by reporter. Condition: ${condition || 'Normal'}. Details: ${description || ''}`.trim(),
      location: {
        lat: report.location.lat,
        lng: report.location.lng,
        address: pickupAddress || address || '',
      },
      priority: 'medium',
      photos: report.photos,
      timeline: [
        {
          status: 'pending',
          note: `Rescue pickup requested from found-pet report #${report._id}`,
          by: req.user._id,
        },
      ],
    });
    report.status = 'rescue_assigned';
    await report.save();
    broadcastToRescueTeams(io, 'rescue:new', rescueRequest);
  }

  res.status(201).json({ success: true, report, possibleMatchCount: possibleMatches.length, rescueRequest });
});

// @desc    List found reports (filterable by status/species/mine)
// @route   GET /api/found-reports
// @access  Private
const getFoundReports = asyncHandler(async (req, res) => {
  const { status, species, mine } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (species) filter.species = species;
  if (mine === 'true') filter.reportedBy = req.user._id;

  const reports = await FoundReport.find(filter)
    .populate('reportedBy', 'name phone email')
    .populate('matchedPet', 'name species images owner')
    .sort('-createdAt');

  res.json({ success: true, count: reports.length, reports });
});

// @desc    Get single found report
// @route   GET /api/found-reports/:id
// @access  Private
const getFoundReportById = asyncHandler(async (req, res) => {
  const report = await FoundReport.findById(req.params.id)
    .populate('reportedBy', 'name phone email')
    .populate('matchedPet');

  if (!report) {
    res.status(404);
    throw new Error('Found report not found');
  }

  res.json({ success: true, report });
});

// @desc    Owner confirms a found report matches their pet -> claims it
// @route   POST /api/found-reports/:id/claim
// @access  Private (owner)
const claimFoundReport = asyncHandler(async (req, res) => {
  const { petId, note } = req.body;
  const report = await FoundReport.findById(req.params.id);

  if (!report) {
    res.status(404);
    throw new Error('Found report not found');
  }

  if (petId) {
    const pet = await Pet.findById(petId);
    if (!pet || pet.owner.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to claim on behalf of this pet');
    }
    report.matchedPet = pet._id;
    pet.status = 'safe';
    await pet.save();
  }

  report.status = 'reunited';
  await report.save();

  const io = req.app.get('io');
  await notifyUser(io, {
    recipient: report.reportedBy,
    type: 'pet_found',
    title: 'Your Found Pet report was claimed by the owner!',
    message: `${req.user.name} identified their pet from your report and sent contact details. ${note ? `Note: "${note}"` : ''}`,
  });

  res.json({ success: true, report });
});

// @desc    Update found report status
// @route   PUT /api/found-reports/:id/status
// @access  Private
const updateFoundReportStatus = asyncHandler(async (req, res) => {
  const { status, matchedPetId } = req.body;
  const report = await FoundReport.findById(req.params.id);
  if (!report) {
    res.status(404);
    throw new Error('Found report not found');
  }

  if (status) report.status = status;
  if (matchedPetId) report.matchedPet = matchedPetId;
  await report.save();

  res.json({ success: true, report });
});

module.exports = {
  createFoundReport,
  getFoundReports,
  getFoundReportById,
  claimFoundReport,
  updateFoundReportStatus,
};
