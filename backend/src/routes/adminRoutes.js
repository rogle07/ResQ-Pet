const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  getUsers,
  getUserById,
  setUserActiveStatus,
  changeUserRole,
  verifyOrganization,
  getAllPets,
  adminDeletePet,
  getPlatformAnalytics,
  getSystemLogs,
} = require('../controllers/adminController');
const { getSettings, updateSetting } = require('../controllers/settingsController');

const router = express.Router();

// Every route in this file is admin-only
router.use(protect, authorize('admin'));

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put(
  '/users/:id/status',
  [body('isActive').isBoolean().withMessage('isActive must be true or false')],
  validate,
  setUserActiveStatus
);
router.put('/users/:id/role', changeUserRole);
router.put('/users/:id/verify', verifyOrganization);

// Pet management
router.get('/pets', getAllPets);
router.delete('/pets/:id', adminDeletePet);

// Analytics & logs
router.get('/analytics', getPlatformAnalytics);
router.get('/logs', getSystemLogs);

// System settings
router.get('/settings', getSettings);
router.put('/settings/:key', updateSetting);

module.exports = router;
