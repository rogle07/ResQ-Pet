const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Pet = require('../models/Pet');
const RescueRequest = require('../models/RescueRequest');
const FoundReport = require('../models/FoundReport');
const Adoption = require('../models/Adoption');
const Donation = require('../models/Donation');
const FosterRequest = require('../models/FosterRequest');
const Notification = require('../models/Notification');

// @desc    List / search / filter users
// @route   GET /api/admin/users
// @access  Private (admin)
const getUsers = asyncHandler(async (req, res) => {
  const { role, search, isActive, page = 1, limit = 25 } = req.query;
  const filter = {};

  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    users: users.map((u) => u.toSafeObject()),
  });
});

// @desc    Get single user detail
// @route   GET /api/admin/users/:id
// @access  Private (admin)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user: user.toSafeObject() });
});

// @desc    Activate / deactivate a user account
// @route   PUT /api/admin/users/:id/status
// @access  Private (admin)
const setUserActiveStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === 'admin' && req.user._id.toString() === user._id.toString() && isActive === false) {
    res.status(400);
    throw new Error('You cannot deactivate your own admin account');
  }

  user.isActive = isActive;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, user: user.toSafeObject() });
});

// @desc    Change a user's role (e.g. promote to admin, correct a signup mistake)
// @route   PUT /api/admin/users/:id/role
// @access  Private (admin)
const changeUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const { ROLES } = require('../models/User');

  if (!ROLES.includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ success: true, user: user.toSafeObject() });
});

// @desc    Verify an NGO / rescue team / veterinarian / foster home account
// @route   PUT /api/admin/users/:id/verify
// @access  Private (admin)
const verifyOrganization = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const detailKeyByRole = {
    ngo: 'ngoDetails',
    rescue_team: 'rescueTeamDetails',
    veterinarian: 'veterinarianDetails',
    foster_home: 'fosterHomeDetails',
  };

  const key = detailKeyByRole[user.role];
  if (!key) {
    res.status(400);
    throw new Error('This user\'s role does not require verification');
  }

  user[key].verified = true;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, user: user.toSafeObject() });
});

// @desc    List all pets (admin oversight)
// @route   GET /api/admin/pets
// @access  Private (admin)
const getAllPets = asyncHandler(async (req, res) => {
  const { status, species, page = 1, limit = 25 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (species) filter.species = species;

  const skip = (Number(page) - 1) * Number(limit);
  const [pets, total] = await Promise.all([
    Pet.find(filter).populate('owner', 'name email').sort('-createdAt').skip(skip).limit(Number(limit)),
    Pet.countDocuments(filter),
  ]);

  res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), pets });
});

// @desc    Force-delete a pet record (moderation)
// @route   DELETE /api/admin/pets/:id
// @access  Private (admin)
const adminDeletePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);
  if (!pet) {
    res.status(404);
    throw new Error('Pet not found');
  }
  await pet.deleteOne();
  res.json({ success: true, message: 'Pet removed by admin' });
});

// @desc    Global platform analytics for the admin dashboard
// @route   GET /api/admin/analytics
// @access  Private (admin)
const getPlatformAnalytics = asyncHandler(async (req, res) => {
  const [
    userCountsByRole,
    petCountsByStatus,
    rescueCountsByStatus,
    foundReportCounts,
    adoptionCounts,
    fosterCounts,
    donationTotals,
    monthlyDonations,
    monthlySignups,
  ] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Pet.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    RescueRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    FoundReport.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Adoption.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    FosterRequest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Donation.aggregate([
      { $match: { status: 'succeeded' } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Donation.aggregate([
      { $match: { status: 'succeeded' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    User.aggregate([
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  res.json({
    success: true,
    analytics: {
      userCountsByRole,
      petCountsByStatus,
      rescueCountsByStatus,
      foundReportCounts,
      adoptionCounts,
      fosterCounts,
      donationTotals: donationTotals[0] || { totalAmount: 0, count: 0 },
      monthlyDonations,
      monthlySignups,
    },
  });
});

// @desc    Recent system activity log (composite feed for admin oversight)
// @route   GET /api/admin/logs
// @access  Private (admin)
const getSystemLogs = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);

  const [recentRescues, recentDonations, recentUsers, recentNotifications] = await Promise.all([
    RescueRequest.find().sort('-createdAt').limit(limit).populate('requestedBy', 'name'),
    Donation.find({ status: 'succeeded' }).sort('-createdAt').limit(limit).populate('donor', 'name'),
    User.find().sort('-createdAt').limit(limit).select('name email role createdAt'),
    Notification.find({ type: 'emergency' }).sort('-createdAt').limit(limit),
  ]);

  res.json({
    success: true,
    logs: { recentRescues, recentDonations, recentUsers, recentEmergencies: recentNotifications },
  });
});

module.exports = {
  getUsers,
  getUserById,
  setUserActiveStatus,
  changeUserRole,
  verifyOrganization,
  getAllPets,
  adminDeletePet,
  getPlatformAnalytics,
  getSystemLogs,
};
