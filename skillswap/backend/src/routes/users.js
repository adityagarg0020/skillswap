import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.put('/profile', protect, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; delete updates.role; delete updates.email;
    
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    user.computeRankScore();
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -googleId');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
