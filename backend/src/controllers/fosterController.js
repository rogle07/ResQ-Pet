const asyncHandler = require('express-async-handler');
const FosterRequest = require('../models/FosterRequest');
const Pet = require('../models/Pet');
const { notifyUser } = require('../services/notificationService');

// @desc    Owner requests temporary foster care for a pet
// @route   POST /api/foster
// @access  Private (owner)
const createFosterRequest = asyncHandler(async (req, res) => {
  const { petId, reason, durationDays, fosterProviderId } = req.body;

  const pet = await Pet.findById(petId);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }
  if (pet.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to request foster care for this pet');
  }

  const fosterRequest = await FosterRequest.create({
    pet: petId,
    requestedBy: req.user._id,
    fosterProvider: fosterProviderId || undefined,
    reason,
    durationDays,
  });

  if (fosterProviderId) {
    const io = req.app.get('io');
    await notifyUser(io, {
      recipient: fosterProviderId,
      type: 'foster_update',
      title: 'New foster care request',
      message: `${req.user.name} has requested foster care for ${pet.name}.`,
      relatedPet: pet._id,
    });
  }

  res.status(201).json({ success: true, fosterRequest });
});

// @desc    List foster requests (owner sees their own, foster_home sees requests directed to them or open ones)
// @route   GET /api/foster
// @access  Private
const getFosterRequests = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;

  if (req.user.role === 'foster_home') {
    filter.$or = [{ fosterProvider: req.user._id }, { fosterProvider: { $exists: false } }, { fosterProvider: null }];
  } else if (req.user.role !== 'admin') {
    filter.requestedBy = req.user._id;
  }

  const requests = await FosterRequest.find(filter)
    .populate('pet', 'name species breed images age gender weightKg vaccinations medicalConditions lastKnownLocation')
    .populate('requestedBy', 'name phone email address')
    .populate('fosterProvider', 'name fosterHomeDetails')
    .sort('-createdAt');

  res.json({ success: true, count: requests.length, requests });
});

// @desc    Get single foster request (includes chat thread)
// @route   GET /api/foster/:id
// @access  Private
const getFosterRequestById = asyncHandler(async (req, res) => {
  const fosterRequest = await FosterRequest.findById(req.params.id)
    .populate('pet')
    .populate('requestedBy', 'name phone email')
    .populate('fosterProvider', 'name phone fosterHomeDetails')
    .populate('messages.sender', 'name role');

  if (!fosterRequest) {
    res.status(404);
    throw new Error('Foster request not found');
  }

  res.json({ success: true, fosterRequest });
});

// @desc    Foster provider accepts a request
// @route   POST /api/foster/:id/accept
// @access  Private (foster_home)
const acceptFosterRequest = asyncHandler(async (req, res) => {
  const fosterRequest = await FosterRequest.findById(req.params.id);
  if (!fosterRequest) {
    res.status(404);
    throw new Error('Foster request not found');
  }
  if (fosterRequest.status !== 'pending') {
    res.status(400);
    throw new Error('This request is no longer pending');
  }

  fosterRequest.fosterProvider = req.user._id;
  fosterRequest.status = 'accepted';
  await fosterRequest.save();

  await Pet.findByIdAndUpdate(fosterRequest.pet, { status: 'in_foster' });

  const io = req.app.get('io');
  await notifyUser(io, {
    recipient: fosterRequest.requestedBy,
    type: 'foster_update',
    title: 'Foster request accepted',
    message: `${req.user.name} has accepted your foster care request.`,
    relatedPet: fosterRequest.pet,
  });

  res.json({ success: true, fosterRequest });
});

// @desc    Foster provider rejects a request
// @route   POST /api/foster/:id/reject
// @access  Private (foster_home)
const rejectFosterRequest = asyncHandler(async (req, res) => {
  const fosterRequest = await FosterRequest.findById(req.params.id);
  if (!fosterRequest) {
    res.status(404);
    throw new Error('Foster request not found');
  }

  fosterRequest.status = 'rejected';
  await fosterRequest.save();

  const io = req.app.get('io');
  await notifyUser(io, {
    recipient: fosterRequest.requestedBy,
    type: 'foster_update',
    title: 'Foster request declined',
    message: `Your foster care request was declined by ${req.user.name}.`,
    relatedPet: fosterRequest.pet,
  });

  res.json({ success: true, fosterRequest });
});

// @desc    Schedule pickup for an accepted foster arrangement
// @route   PUT /api/foster/:id/schedule-pickup
// @access  Private (fosterProvider or requestedBy)
const schedulePickup = asyncHandler(async (req, res) => {
  const fosterRequest = await FosterRequest.findById(req.params.id);
  if (!fosterRequest) {
    res.status(404);
    throw new Error('Foster request not found');
  }

  const isParticipant =
    fosterRequest.requestedBy.toString() === req.user._id.toString() ||
    fosterRequest.fosterProvider?.toString() === req.user._id.toString();

  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized');
  }

  fosterRequest.pickupScheduledAt = req.body.pickupScheduledAt;
  fosterRequest.status = 'active';
  await fosterRequest.save();

  res.json({ success: true, fosterRequest });
});

// @desc    Send a chat message within a foster request thread
// @route   POST /api/foster/:id/messages
// @access  Private (participant)
const sendFosterMessage = asyncHandler(async (req, res) => {
  const fosterRequest = await FosterRequest.findById(req.params.id);
  if (!fosterRequest) {
    res.status(404);
    throw new Error('Foster request not found');
  }

  const isParticipant =
    fosterRequest.requestedBy.toString() === req.user._id.toString() ||
    fosterRequest.fosterProvider?.toString() === req.user._id.toString();

  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const message = { sender: req.user._id, text: req.body.text, sentAt: new Date() };
  fosterRequest.messages.push(message);
  await fosterRequest.save();

  const io = req.app.get('io');
  const recipientId =
    fosterRequest.requestedBy.toString() === req.user._id.toString()
      ? fosterRequest.fosterProvider
      : fosterRequest.requestedBy;

  if (recipientId) {
    io?.to(`owner:${recipientId}`).emit('foster:message', { fosterRequestId: fosterRequest._id, message });
  }

  res.status(201).json({ success: true, message });
});

// @desc    Mark a foster arrangement complete (pet returns to owner)
// @route   POST /api/foster/:id/complete
// @access  Private (participant)
const completeFosterRequest = asyncHandler(async (req, res) => {
  const fosterRequest = await FosterRequest.findById(req.params.id);
  if (!fosterRequest) {
    res.status(404);
    throw new Error('Foster request not found');
  }

  fosterRequest.status = 'completed';
  await fosterRequest.save();

  await Pet.findByIdAndUpdate(fosterRequest.pet, { status: 'safe' });

  res.json({ success: true, fosterRequest });
});

module.exports = {
  createFosterRequest,
  getFosterRequests,
  getFosterRequestById,
  acceptFosterRequest,
  rejectFosterRequest,
  schedulePickup,
  sendFosterMessage,
  completeFosterRequest,
};
