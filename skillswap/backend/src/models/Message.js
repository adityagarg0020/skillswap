import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  type: { type: String, enum: ['text', 'file', 'image', 'emoji', 'system'], default: 'text' },
  fileUrl: String,
  fileName: String,
  seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Message', messageSchema);
