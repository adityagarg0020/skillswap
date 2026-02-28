const { Booking } = require('../models/ReviewNotificationBooking');
const Session = require('../models/Session');
const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

// @POST /api/bookings
const createBooking = async (req, res) => {
  try {
    const { mentorId, skill, scheduledAt, duration, message } = req.body;
    
    const mentor = await User.findById(mentorId);
    if (!mentor || !mentor.isMentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }
    
    // Check for conflicts
    const conflictingBooking = await Booking.findOne({
      mentor: mentorId,
      scheduledAt: { $gte: new Date(scheduledAt), $lte: new Date(new Date(scheduledAt).getTime() + duration * 60000) },
      status: 'accepted'
    });
    
    if (conflictingBooking) {
      return res.status(400).json({ success: false, message: 'Mentor is not available at this time' });
    }
    
    const booking = await Booking.create({
      mentor: mentorId,
      learner: req.user._id,
      skill,
      scheduledAt: new Date(scheduledAt),
      duration,
      message
    });
    
    await booking.populate(['mentor', 'learner'], 'name avatar email');
    
    await createNotification(
      mentorId, 'session_request',
      `New booking request from ${req.user.name}`,
      `For "${skill}" on ${new Date(scheduledAt).toLocaleDateString()}`,
      { bookingId: booking._id }
    );
    
    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/bookings/:id/respond
const respondToBooking = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body; // action: 'accept' or 'reject'
    
    const booking = await Booking.findById(req.params.id).populate(['mentor', 'learner'], 'name');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    
    if (booking.mentor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the mentor can respond' });
    }
    
    if (action === 'accept') {
      booking.status = 'accepted';
      
      // Create a scheduled session
      const session = await Session.create({
        mentor: booking.mentor._id,
        learner: booking.learner._id,
        skill: booking.skill,
        scheduledAt: booking.scheduledAt,
        pricePerMinute: (await User.findById(booking.mentor._id)).pricePerMinute,
        status: 'scheduled',
        agoraChannel: `skillswap_${booking._id}`
      });
      
      booking.session = session._id;
      
      await createNotification(booking.learner._id, 'session_accepted', 'Booking Accepted!',
        `${booking.mentor.name} accepted your booking for "${booking.skill}"`);
    } else {
      booking.status = 'rejected';
      booking.rejectionReason = rejectionReason;
      
      await createNotification(booking.learner._id, 'session_rejected', 'Booking Declined',
        `${booking.mentor.name} declined your booking.`);
    }
    
    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/bookings
const getBookings = async (req, res) => {
  try {
    const { role, status } = req.query;
    let query = {};
    
    if (role === 'mentor') query.mentor = req.user._id;
    else if (role === 'learner') query.learner = req.user._id;
    else query.$or = [{ mentor: req.user._id }, { learner: req.user._id }];
    
    if (status) query.status = status;
    
    const bookings = await Booking.find(query)
      .populate('mentor', 'name avatar pricePerMinute')
      .populate('learner', 'name avatar')
      .sort('-createdAt');
    
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createBooking, respondToBooking, getBookings };
