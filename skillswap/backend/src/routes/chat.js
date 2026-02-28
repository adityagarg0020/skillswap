import express from 'express';
import { getConversations, getOrCreateConversation, getMessages } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.get('/conversations', protect, getConversations);
router.get('/conversation/:userId', protect, getOrCreateConversation);
router.get('/messages/:conversationId', protect, getMessages);
export default router;
