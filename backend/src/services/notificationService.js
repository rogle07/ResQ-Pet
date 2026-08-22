const Notification = require('../models/Notification');
const logger = require('../utils/logger');

/**
 * Creates a notification record, emits it via Socket.io to the recipient's room,
 * and (in a full build) would dispatch FCM push / email based on `channel`.
 *
 * @param {object} io - Socket.io instance (req.app.get('io'))
 * @param {object} params
 */
const notifyUser = async (io, { recipient, type, title, message, relatedPet, channel = ['in_app'] }) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      relatedPet,
      channel,
    });

    if (io) {
      io.to(`owner:${recipient}`).emit('notification:new', notification);
    }

    return notification;
  } catch (error) {
    logger.error(`Failed to create notification: ${error.message}`);
  }
};

/**
 * Broadcasts an event to all connected rescue-team dashboards (e.g. new emergency).
 */
const broadcastToRescueTeams = (io, event, payload) => {
  if (io) io.to('rescueTeamRoom').emit(event, payload);
};

module.exports = { notifyUser, broadcastToRescueTeams };
