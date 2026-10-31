const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getOrCreateConversation,
  myConversations,
  getMessages,
  sendMessage,
} = require('../controllers/chatController');

router.use(protect);
router.post('/conversations', getOrCreateConversation);
router.get('/conversations', myConversations);
router.get('/conversations/:convId/messages', getMessages);
router.post('/conversations/:convId/messages', sendMessage);

module.exports = router;
