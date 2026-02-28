import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.get('/', protect, async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30);
  res.json({ success: true, notifications });
});
router.patch('/read-all', protect, async (req, res) => {
  await Notification.updateMany({ user: req.user._id }, { isRead: true });
  res.json({ success: true });
});
export default router;
