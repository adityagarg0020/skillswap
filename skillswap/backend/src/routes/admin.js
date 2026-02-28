import express from 'express';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Transaction from '../models/Transaction.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();
router.use(protect, adminOnly);

router.get('/stats', async (req, res) => {
  const [users, sessions, revenue] = await Promise.all([
    User.countDocuments(),
    Session.countDocuments({ status: 'completed' }),
    Transaction.aggregate([{ $match: { type: 'debit' } }, { $group: { _id: null, total: { $sum: '$amount' } } }])
  ]);
  res.json({ success: true, users, sessions, revenue: revenue[0]?.total || 0 });
});

router.get('/users', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const users = await User.find().sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit)).select('-password');
  const total = await User.countDocuments();
  res.json({ success: true, users, total });
});

router.patch('/users/:id/ban', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBanned: req.body.ban }, { new: true });
  res.json({ success: true, user });
});

router.patch('/users/:id/verify-mentor', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
  res.json({ success: true, user });
});

export default router;
