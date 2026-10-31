const asyncHandler = require('express-async-handler');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @desc  Get or create conversation for a case
// @route POST /api/chat/conversations
// @access Private
exports.getOrCreateConversation = asyncHandler(async (req, res) => {
  const { type, caseId, participants } = req.body;

  let conv = await Conversation.findOne({ type, caseId });
  if (!conv) {
    conv = await Conversation.create({ type, caseId, participants });
  } else {
    // Ensure all participants are in the conversation
    const existing = conv.participants.map(String);
    const toAdd = participants.filter((p) => !existing.includes(String(p)));
    if (toAdd.length > 0) {
      conv.participants.push(...toAdd);
      await conv.save();
    }
  }

  await conv.populate('participants', 'name avatar role');
  res.json({ success: true, conversation: conv });
});

// @desc  Get conversations for current user
// @route GET /api/chat/conversations
// @access Private
exports.myConversations = asyncHandler(async (req, res) => {
  const convs = await Conversation.find({ participants: req.user._id })
    .populate('participants', 'name avatar role')
    .sort({ lastMessageAt: -1 });
  res.json({ success: true, conversations: convs });
});

// @desc  Get messages for a conversation
// @route GET /api/chat/conversations/:convId/messages
// @access Private
exports.getMessages = asyncHandler(async (req, res) => {
  const conv = await Conversation.findById(req.params.convId);
  if (!conv) {
    res.status(404);
    throw new Error('Conversation not found');
  }
  if (!conv.participants.map(String).includes(req.user._id.toString())) {
    res.status(403);
    throw new Error('Not authorized to access this conversation');
  }

  const messages = await Message.find({ conversation: req.params.convId })
    .populate('sender', 'name avatar role')
    .sort({ createdAt: 1 });

  // Mark as read
  await Message.updateMany(
    { conversation: req.params.convId, sender: { $ne: req.user._id }, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.json({ success: true, messages });
});

// @desc  Send a message
// @route POST /api/chat/conversations/:convId/messages
// @access Private
exports.sendMessage = asyncHandler(async (req, res) => {
  const conv = await Conversation.findById(req.params.convId);
  if (!conv) {
    res.status(404);
    throw new Error('Conversation not found');
  }
  if (!conv.participants.map(String).includes(req.user._id.toString())) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const msg = await Message.create({
    conversation: conv._id,
    sender: req.user._id,
    text: req.body.text,
    imageUrl: req.body.imageUrl,
  });

  await msg.populate('sender', 'name avatar role');

  conv.lastMessage = req.body.text || '[image]';
  conv.lastMessageAt = new Date();
  await conv.save();

  // Emit via socket
  const io = req.app.get('io');
  if (io) {
    conv.participants.forEach((p) => {
      io.to(`user:${p.toString()}`).emit('chat:message', {
        conversationId: conv._id,
        message: msg,
      });
    });
  }

  res.status(201).json({ success: true, message: msg });
});
