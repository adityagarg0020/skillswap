import express from 'express';
import { generateToken } from '../controllers/videoController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.post('/token', protect, generateToken);
export default router;
