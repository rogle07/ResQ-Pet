const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'pet_lost', 'pet_found', 'rescue_accepted', 'rescue_completed',
        'donation_success', 'low_battery', 'emergency', 'foster_update',
        'adoption_update', 'system',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedPet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
    isRead: { type: Boolean, default: false, index: true },
    channel: { type: [String], enum: ['push', 'email', 'sms', 'in_app'], default: ['in_app'] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
