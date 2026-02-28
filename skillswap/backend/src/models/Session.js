import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  
  startTime: Date,
  endTime: Date,
  duration: { type: Number, default: 0 }, // minutes
  
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  
  totalCost: { type: Number, default: 0 },
  pricePerMinute: { type: Number, default: 5 },
  platformFee: { type: Number, default: 0 },
  mentorEarning: { type: Number, default: 0 },
  
  agoraChannelName: String,
  recordingUrl: String,
  
  summary: String, // AI generated summary
  topicsDiscussed: [String],
  
  feedback: {
    fromLearner: String,
    fromMentor: String
  }
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);
