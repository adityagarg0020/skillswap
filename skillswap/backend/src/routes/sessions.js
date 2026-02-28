import express from 'express';
import { startSession, endSession, getUserSessions } from '../controllers/sessionController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.post('/start', protect, startSession);
router.post('/:sessionId/end', protect, endSession);
router.get('/', protect, getUserSessions);
export default router;
