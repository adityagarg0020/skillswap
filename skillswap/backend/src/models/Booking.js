import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 60 }, // planned minutes
  skill: String,
  message: String,
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'], default: 'pending' },
  rejectionReason: String,
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);
