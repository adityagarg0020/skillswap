import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  learner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 1000 },
  isVerified: { type: Boolean, default: true }, // only post-session reviews
}, { timestamps: true });

reviewSchema.index({ mentor: 1, learner: 1, session: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
