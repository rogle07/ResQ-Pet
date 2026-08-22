const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Get logged-in user's notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly } = req.query;
  const filter = { recipient: req.user._id };
  if (unreadOnly === 'true') filter.isRead = false;

  const notifications = await Notification.find(filter).sort('-createdAt').limit(100);
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

  res.json({ success: true, count: notifications.length, unreadCount, notifications });
});

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  res.json({ success: true, notification });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: 'All notifications marked as read' });
});

// @desc    Register a device's FCM token for push notifications
// @route   POST /api/notifications/fcm-token
// @access  Private
const registerFcmToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) {
    res.status(400);
    throw new Error('FCM token is required');
  }

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { fcmTokens: token } });
  res.json({ success: true, message: 'Push token registered' });
});

module.exports = { getNotifications, markAsRead, markAllAsRead, registerFcmToken };
