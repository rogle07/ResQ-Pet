const asyncHandler = require('express-async-handler');
const SystemSetting = require('../models/SystemSetting');

// Sensible defaults if a key hasn't been explicitly set yet
const DEFAULT_SETTINGS = {
  emergencyHighTempThresholdC: 39.5,
  emergencyNoMovementMinutes: 30,
  emergencyLowBatteryPercent: 15,
  foundReportMatchRadiusMeters: 5000,
  maintenanceMode: false,
  platformName: 'PetGuardian',
};

// @desc    Get all system settings (merged with defaults)
// @route   GET /api/admin/settings
// @access  Private (admin)
const getSettings = asyncHandler(async (req, res) => {
  const stored = await SystemSetting.find();
  const storedMap = Object.fromEntries(stored.map((s) => [s.key, s.value]));

  res.json({ success: true, settings: { ...DEFAULT_SETTINGS, ...storedMap } });
});

// @desc    Update or create a system setting
// @route   PUT /api/admin/settings/:key
// @access  Private (admin)
const updateSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  const setting = await SystemSetting.findOneAndUpdate(
    { key },
    { value, updatedBy: req.user._id },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, setting });
});

module.exports = { getSettings, updateSetting, DEFAULT_SETTINGS };
