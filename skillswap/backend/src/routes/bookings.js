import express from 'express';
import Booking from '../models/Booking.js';
import { protect } from '../middleware/auth.js';
import { createNotification } from '../utils/notify.js';

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { mentorId, scheduledAt, duration, skill, message } = req.body;
    const booking = await Booking.create({ mentor: mentorId, learner: req.user._id, scheduledAt, duration, skill, message });
    const io = req.app.get('io');
    await createNotification(io, { userId: mentorId, type: 'booking', title: 'New Booking Request', message: `${req.user.name} wants to book a session`, data: { bookingId: booking._id } });
    res.status(201).json({ success: true, booking });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ $or: [{ mentor: req.user._id }, { learner: req.user._id }] })
      .populate('mentor learner', 'name avatar').sort({ scheduledAt: 1 });
    res.json({ success: true, bookings });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status, rejectionReason }, { new: true });
    res.json({ success: true, booking });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

export default router;
