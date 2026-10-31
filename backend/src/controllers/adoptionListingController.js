const asyncHandler = require('express-async-handler');
const { AdoptionListing, AdoptionRequest } = require('../models/Adoption');

// @desc List all available adoption listings
// @route GET /api/adoption-listings
// @access Public
exports.listListings = asyncHandler(async (req, res) => {
  const { animalType, breed, page = 1, limit = 20 } = req.query;
  const filter = { status: 'available' };
  if (animalType) filter.animalType = animalType;
  if (breed) filter.breed = new RegExp(breed, 'i');

  const listings = await AdoptionListing.find(filter)
    .populate('listedBy', 'name email phone')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await AdoptionListing.countDocuments(filter);
  res.json({ success: true, listings, total });
});

// @desc Create a listing
// @route POST /api/adoption-listings
// @access Private (owner, ngo)
exports.createListing = asyncHandler(async (req, res) => {
  const listing = await AdoptionListing.create({
    ...req.body,
    listedBy: req.user._id,
  });
  res.status(201).json({ success: true, listing });
});

// @desc Get my listings
// @route GET /api/adoption-listings/my
// @access Private
exports.myListings = asyncHandler(async (req, res) => {
  const listings = await AdoptionListing.find({ listedBy: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, listings });
});

// @desc Get single listing
// @route GET /api/adoption-listings/:id
// @access Public
exports.getListing = asyncHandler(async (req, res) => {
  const listing = await AdoptionListing.findById(req.params.id).populate('listedBy', 'name email phone');
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  res.json({ success: true, listing });
});

// @desc Submit adoption request
// @route POST /api/adoption-listings/:id/apply
// @access Private
exports.applyForAdoption = asyncHandler(async (req, res) => {
  const listing = await AdoptionListing.findById(req.params.id);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }
  if (listing.status !== 'available') {
    res.status(400);
    throw new Error('This pet is no longer available for adoption');
  }

  const existing = await AdoptionRequest.findOne({
    listing: listing._id,
    applicant: req.user._id,
    status: { $nin: ['rejected', 'cancelled'] },
  });
  if (existing) {
    res.status(400);
    throw new Error('You already have a pending application for this pet');
  }

  const request = await AdoptionRequest.create({
    listing: listing._id,
    applicant: req.user._id,
    listingOwner: listing.listedBy,
    applicationNote: req.body.applicationNote,
    agreedFee: listing.adoptionFee,
    paymentRequired: listing.adoptionFee > 0,
    paymentStatus: listing.adoptionFee > 0 ? 'pending' : 'not_required',
  });

  res.status(201).json({ success: true, request });
});

// @desc Get my adoption requests (as applicant)
// @route GET /api/adoption-listings/my-requests
// @access Private
exports.myRequests = asyncHandler(async (req, res) => {
  const requests = await AdoptionRequest.find({ applicant: req.user._id })
    .populate('listing')
    .populate('listingOwner', 'name email phone')
    .sort({ createdAt: -1 });
  res.json({ success: true, requests });
});

// @desc Get received adoption requests (as owner)
// @route GET /api/adoption-listings/received-requests
// @access Private
exports.receivedRequests = asyncHandler(async (req, res) => {
  const requests = await AdoptionRequest.find({ listingOwner: req.user._id })
    .populate('listing')
    .populate('applicant', 'name email phone avatar')
    .sort({ createdAt: -1 });
  res.json({ success: true, requests });
});

// @desc Update adoption request status
// @route PATCH /api/adoption-listings/requests/:requestId
// @access Private
exports.updateRequest = asyncHandler(async (req, res) => {
  const request = await AdoptionRequest.findById(req.params.requestId);
  if (!request) {
    res.status(404);
    throw new Error('Request not found');
  }

  const isOwner = request.listingOwner.toString() === req.user._id.toString();
  const isApplicant = request.applicant.toString() === req.user._id.toString();

  if (!isOwner && !isApplicant && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (req.body.status) request.status = req.body.status;
  if (req.body.ownerAgreed !== undefined) request.ownerAgreed = req.body.ownerAgreed;
  if (req.body.applicantAgreed !== undefined) request.applicantAgreed = req.body.applicantAgreed;
  if (req.body.decisionNote) request.decisionNote = req.body.decisionNote;

  // Auto-progress to agreement_completed when both agree
  if (request.ownerAgreed && request.applicantAgreed && request.status === 'negotiation') {
    request.status = 'agreement_completed';
    if (request.paymentRequired) {
      request.status = 'payment_pending';
    }
  }

  await request.save();
  res.json({ success: true, request });
});
