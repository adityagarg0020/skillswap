import express from 'express';
import Review from '../models/Review.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { mentorId, sessionId, rating, comment } = req.body;
    const review = await Review.create({ mentor: mentorId, learner: req.user._id, session: sessionId, rating, comment });
    
    // Update mentor rating
    const reviews = await Review.find({ mentor: mentorId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(mentorId, { rating: avgRating, totalRatings: reviews.length });
    
    res.status(201).json({ success: true, review });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/mentor/:mentorId', async (req, res) => {
  try {
    const reviews = await Review.find({ mentor: req.params.mentorId })
      .populate('learner', 'name avatar').sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

export default router;
