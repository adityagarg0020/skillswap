import express from 'express';
import { getMentors, getMentorById, getRecommendations } from '../controllers/mentorController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.get('/', getMentors);
router.get('/recommendations', protect, getRecommendations);
router.get('/:id', getMentorById);
export default router;
