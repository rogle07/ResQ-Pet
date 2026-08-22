const asyncHandler = require('express-async-handler');
const RescueRequest = require('../models/RescueRequest');
const Pet = require('../models/Pet');
const { uploadFilesToCloudinary } = require('../middleware/upload');
const { notifyUser, broadcastToRescueTeams } = require('../services/notificationService');

// @desc    Create a manual rescue request (injured/stray animal, or owner-initiated)
// @route   POST /api/rescue
// @access  Private
const createRescueRequest = asyncHandler(async (req, res) => {
  const { petId, type, description, lat, lng, address, priority } = req.body;

  const rescueRequest = await RescueRequest.create({
    pet: petId || undefined,
    requestedBy: req.user._id,
    type,
    description,
    location: { lat, lng, address },
    priority: priority || 'medium',
    photos: req.files?.length ? await uploadFilesToCloudinary(req.files, 'rescue') : [],
    timeline: [{ status: 'pending', note: 'Rescue request submitted', by: req.user._id }],
  });

  const io = req.app.get('io');
  broadcastToRescueTeams(io, 'rescue:new', rescueRequest);

  res.status(201).json({ success: true, rescueRequest });
});

// @desc    List rescue requests (rescue team sees all pending/assigned; user sees own)
// @route   GET /api/rescue
// @access  Private
const getRescueRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};

  if (req.user.role === 'rescue_team') {
    if (status) filter.status = status;
  } else if (req.user.role === 'admin') {
    if (status) filter.status = status;
  } else {
    filter.requestedBy = req.user._id;
  }

  const requests = await RescueRequest.find(filter)
    .populate('pet', 'name species images')
    .populate('requestedBy', 'name phone')
    .populate('assignedTeam', 'name rescueTeamDetails')
    .sort('-createdAt');

  res.json({ success: true, count: requests.length, requests });
});

// @desc    Get single rescue request
// @route   GET /api/rescue/:id
// @access  Private
const getRescueRequestById = asyncHandler(async (req, res) => {
  const rescueRequest = await RescueRequest.findById(req.params.id)
    .populate('pet')
    .populate('requestedBy', 'name phone email')
    .populate('assignedTeam', 'name rescueTeamDetails');

  if (!rescueRequest) {
    res.status(404);
    throw new Error('Rescue request not found');
  }

  res.json({ success: true, rescueRequest });
});

// @desc    Accept a rescue request (rescue team claims it)
// @route   POST /api/rescue/:id/accept
// @access  Private (rescue_team)
const acceptRescueRequest = asyncHandler(async (req, res) => {
  const rescueRequest = await RescueRequest.findById(req.params.id);
  if (!rescueRequest) {
    res.status(404);
    throw new Error('Rescue request not found');
  }
  if (rescueRequest.status !== 'pending') {
    res.status(400);
    throw new Error('This request has already been accepted or resolved');
  }

  rescueRequest.assignedTeam = req.user._id;
  rescueRequest.status = 'accepted';
  rescueRequest.timeline.push({ status: 'accepted', note: `Accepted by ${req.user.name}`, by: req.user._id });
  await rescueRequest.save();

  const io = req.app.get('io');
  await notifyUser(io, {
    recipient: rescueRequest.requestedBy,
    type: 'rescue_accepted',
    title: 'Your rescue request was accepted',
    message: `${req.user.rescueTeamDetails?.teamName || req.user.name} is on the way.`,
    relatedPet: rescueRequest.pet,
  });

  res.json({ success: true, rescueRequest });
});

// @desc    Update rescue status / add progress note / upload photos
// @route   PUT /api/rescue/:id/status
// @access  Private (assigned rescue_team)
const updateRescueStatus = asyncHandler(async (req, res) => {
  const rescueRequest = await RescueRequest.findById(req.params.id);
  if (!rescueRequest) {
    res.status(404);
    throw new Error('Rescue request not found');
  }
  if (rescueRequest.assignedTeam?.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this rescue request');
  }

  const { status, note } = req.body;
  const validStatuses = ['in_progress', 'completed', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  if (status) rescueRequest.status = status;
  if (req.files?.length) {
    const newPhotos = await uploadFilesToCloudinary(req.files, 'rescue');
    rescueRequest.photos.push(...newPhotos);
  }
  rescueRequest.timeline.push({ status: status || 'update', note, by: req.user._id });

  if (status === 'completed') {
    rescueRequest.closedAt = new Date();
    if (rescueRequest.pet) {
      await Pet.findByIdAndUpdate(rescueRequest.pet, { status: 'safe' });
    }
  }

  await rescueRequest.save();

  const io = req.app.get('io');
  if (status === 'completed') {
    await notifyUser(io, {
      recipient: rescueRequest.requestedBy,
      type: 'rescue_completed',
      title: 'Rescue completed',
      message: 'Your rescue request has been marked as completed.',
      relatedPet: rescueRequest.pet,
    });
  }

  res.json({ success: true, rescueRequest });
});

module.exports = {
  createRescueRequest,
  getRescueRequests,
  getRescueRequestById,
  acceptRescueRequest,
  updateRescueStatus,
};
