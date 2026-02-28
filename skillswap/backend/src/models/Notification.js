import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['booking', 'session', 'payment', 'review', 'badge', 'message', 'system'], required: true },
  title: String,
  message: String,
  data: mongoose.Schema.Types.Mixed,
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
