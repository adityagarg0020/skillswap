const mongoose = require('mongoose');

// ==================== REVIEW ====================
const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 1000 },
  
  tags: [{ type: String, enum: ['knowledgeable', 'patient', 'communicative', 'practical', 'engaging', 'professional'] }],
  
  isPublic: { type: Boolean, default: true },
  
}, { timestamps: true });

reviewSchema.index({ reviewee: 1, createdAt: -1 });
reviewSchema.index({ session: 1 });

// ==================== NOTIFICATION ====================
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  type: {
    type: String,
    enum: [
      'session_request', 'session_accepted', 'session_rejected', 'session_started',
      'session_ended', 'session_reminder', 'message_received', 'review_received',
      'wallet_credit', 'wallet_debit', 'badge_earned', 'level_up', 'system'
    ]
  },
  
  title: { type: String, required: true },
  body: String,
  
  data: { type: mongoose.Schema.Types.Mixed }, // Extra data like sessionId, userId, etc.
  
  isRead: { type: Boolean, default: false },
  
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

// ==================== BOOKING ====================
const bookingSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  skill: { type: String, required: true },
  message: String, // learner's message to mentor
  
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 60 }, // requested duration in minutes
  
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  rejectionReason: String,
  
}, { timestamps: true });

bookingSchema.index({ mentor: 1, status: 1 });
bookingSchema.index({ learner: 1, status: 1 });
bookingSchema.index({ scheduledAt: 1 });

module.exports = {
  Review: mongoose.model('Review', reviewSchema),
  Notification: mongoose.model('Notification', notificationSchema),
  Booking: mongoose.model('Booking', bookingSchema),
};
