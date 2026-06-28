const router = require('express').Router();
const { getConversations, getOrCreateConversation, getMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

module.exports = router;
