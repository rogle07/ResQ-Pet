const asyncHandler = require('express-async-handler');
const LostPetReport = require('../models/LostPetReport');
const FoundReport = require('../models/FoundReport');

// ── Helper: simple weighted matching ────────────────────────────────────
const calculateMatchScore = (lost, found) => {
  let score = 0;
  let maxScore = 0;

  // Animal type (highest weight)
  maxScore += 30;
  if (lost.animalType && found.species &&
      lost.animalType.toLowerCase() === found.species.toLowerCase()) {
    score += 30;
  }

  // Gender
  maxScore += 10;
  if (lost.gender && found.gender && lost.gender !== 'unknown' && found.gender !== 'unknown') {
    if (lost.gender === found.gender) score += 10;
  }

  // Breed (partial match)
  maxScore += 20;
  if (lost.breed && found.breed) {
    const lb = lost.breed.toLowerCase();
    const fb = found.breed.toLowerCase();
    if (lb === fb) score += 20;
    else if (lb.includes(fb) || fb.includes(lb)) score += 10;
  }

  // Color
  maxScore += 15;
  if (lost.color && found.color) {
    const lc = lost.color.toLowerCase();
    const fc = found.color.toLowerCase();
    if (lc === fc) score += 15;
    else if (lc.includes(fc) || fc.includes(lc)) score += 7;
  }

  // Location proximity
  maxScore += 25;
  if (
    lost.lastKnownLocation?.lat && lost.lastKnownLocation?.lng &&
    found.location?.lat && found.location?.lng
  ) {
    const R = 6371;
    const dLat = ((found.location.lat - lost.lastKnownLocation.lat) * Math.PI) / 180;
    const dLng = ((found.location.lng - lost.lastKnownLocation.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lost.lastKnownLocation.lat * Math.PI) / 180) *
        Math.cos((found.location.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (distKm <= 1) score += 25;
    else if (distKm <= 3) score += 18;
    else if (distKm <= 10) score += 10;
    else if (distKm <= 25) score += 5;
  }

  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
};

// @desc  Create a lost pet report
// @route POST /api/lost-pets
// @access Private (lost_pet role)
exports.createReport = asyncHandler(async (req, res) => {
  const data = { ...req.body, reportedBy: req.user._id };
  const report = await LostPetReport.create(data);

  // Run matching against found reports
  const foundReports = await FoundReport.find({ status: { $nin: ['reunited', 'closed', 'claimed'] } });
  let bestMatch = null;
  let bestScore = 0;

  for (const fr of foundReports) {
    const s = calculateMatchScore(report, fr);
    if (s > bestScore) {
      bestScore = s;
      bestMatch = fr;
    }
  }

  if (bestScore >= 50 && bestMatch) {
    report.matchedFoundReport = bestMatch._id;
    report.matchScore = bestScore;
    report.status = 'potential_match_found';
    await report.save();
  }

  res.status(201).json({ success: true, report });
});

// @desc  Get all lost pet reports (public listing)
// @route GET /api/lost-pets
// @access Public
exports.listReports = asyncHandler(async (req, res) => {
  const { status, animalType, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (animalType) filter.animalType = animalType;

  const reports = await LostPetReport.find(filter)
    .populate('reportedBy', 'name email phone')
    .populate('matchedFoundReport')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await LostPetReport.countDocuments(filter);
  res.json({ success: true, reports, total });
});

// @desc  Get my lost pet reports
// @route GET /api/lost-pets/my
// @access Private
exports.myReports = asyncHandler(async (req, res) => {
  const reports = await LostPetReport.find({ reportedBy: req.user._id })
    .populate('matchedFoundReport')
    .sort({ createdAt: -1 });
  res.json({ success: true, reports });
});

// @desc  Get matches for the current user's lost reports (Lost Pet role)
// @route GET /api/lost-pets/my-matches
// @access Private
exports.myMatches = asyncHandler(async (req, res) => {
  const myLostReports = await LostPetReport.find({
    reportedBy: req.user._id,
    status: { $in: ['potential_match_found', 'verification_pending'] },
  }).populate('matchedFoundReport');

  const matches = myLostReports
    .filter((r) => r.matchedFoundReport)
    .map((r) => ({
      lostReport: r,
      foundReport: r.matchedFoundReport,
      matchScore: r.matchScore || 0,
    }));

  res.json({ success: true, matches });
});

// @desc  Get matches for the finder's found reports
// @route GET /api/lost-pets/finder-matches
// @access Private (finder role)
exports.finderMatches = asyncHandler(async (req, res) => {
  // Get all found reports by this finder
  const myFoundReports = await FoundReport.find({ reportedBy: req.user._id });

  const matches = [];
  for (const fr of myFoundReports) {
    const lostReports = await LostPetReport.find({
      status: { $in: ['missing', 'searching', 'potential_match_found'] },
    }).populate('reportedBy', 'name');

    for (const lr of lostReports) {
      const score = calculateMatchScore(lr, fr);
      if (score >= 50) {
        matches.push({
          foundReport: fr,
          lostReport: lr,
          matchScore: score,
        });
      }
    }
  }

  matches.sort((a, b) => b.matchScore - a.matchScore);
  res.json({ success: true, matches });
});

// @desc  Get a single report
// @route GET /api/lost-pets/:id
// @access Public
exports.getReport = asyncHandler(async (req, res) => {
  const report = await LostPetReport.findById(req.params.id)
    .populate('reportedBy', 'name email phone')
    .populate('matchedFoundReport');
  if (!report) {
    res.status(404);
    throw new Error('Lost pet report not found');
  }
  res.json({ success: true, report });
});

// @desc  Update a lost pet report status
// @route PATCH /api/lost-pets/:id/status
// @access Private (owner of report or admin)
exports.updateStatus = asyncHandler(async (req, res) => {
  const report = await LostPetReport.findById(req.params.id);
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }
  if (report.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  report.status = req.body.status || report.status;
  await report.save();
  res.json({ success: true, report });
});

// @desc  Close a lost pet report
// @route PATCH /api/lost-pets/:id/close
// @access Private
exports.closeReport = asyncHandler(async (req, res) => {
  const report = await LostPetReport.findById(req.params.id);
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }
  if (report.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }
  report.status = 'closed';
  await report.save();
  res.json({ success: true, report });
});

// @desc  Verify or reject a match
// @route PATCH /api/lost-pets/:id/verify-match
// @access Private
exports.verifyMatch = asyncHandler(async (req, res) => {
  const { foundReportId, action } = req.body; // action: 'confirm' | 'reject'
  const report = await LostPetReport.findById(req.params.id);
  if (!report) {
    res.status(404);
    throw new Error('Report not found');
  }
  if (report.reportedBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (action === 'confirm') {
    report.status = 'reunited';
    // Also update found report status
    await FoundReport.findByIdAndUpdate(foundReportId, { status: 'reunited' });
  } else {
    report.status = 'searching';
    report.matchedFoundReport = null;
    report.matchScore = 0;
  }
  await report.save();
  res.json({ success: true, report });
});

// @desc  Run matching for a found report against lost reports
// @route POST /api/lost-pets/match/:foundReportId
// @access Private
exports.matchFound = asyncHandler(async (req, res) => {
  const foundReport = await FoundReport.findById(req.params.foundReportId);
  if (!foundReport) {
    res.status(404);
    throw new Error('Found report not found');
  }

  const lostReports = await LostPetReport.find({
    status: { $in: ['missing', 'searching'] },
  }).populate('reportedBy', 'name email');

  const matches = [];
  for (const lr of lostReports) {
    const score = calculateMatchScore(lr, foundReport);
    if (score >= 40) {
      let distanceKm = null;
      if (lr.lastKnownLocation?.lat && foundReport.location?.lat) {
        const R = 6371;
        const dLat = ((foundReport.location.lat - lr.lastKnownLocation.lat) * Math.PI) / 180;
        const dLng = ((foundReport.location.lng - lr.lastKnownLocation.lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lr.lastKnownLocation.lat * Math.PI) / 180) *
            Math.cos((foundReport.location.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        distanceKm = +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
      }

      matches.push({
        lostReport: lr,
        foundReport,
        matchScore: score,
        distanceKm,
        matchingFields: {
          animalType: lr.animalType === foundReport.species,
          breed: !!(lr.breed && foundReport.breed && lr.breed.toLowerCase() === foundReport.breed.toLowerCase()),
          color: !!(lr.color && foundReport.color && lr.color.toLowerCase() === foundReport.color.toLowerCase()),
          gender: lr.gender === foundReport.gender,
        },
      });
    }
  }

  matches.sort((a, b) => b.matchScore - a.matchScore);
  res.json({ success: true, matches });
});
