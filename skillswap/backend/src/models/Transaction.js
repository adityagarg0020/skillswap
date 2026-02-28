import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['credit', 'debit', 'refund', 'withdrawal', 'commission'], required: true },
  amount: { type: Number, required: true },
  description: String,
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'success' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  balance: Number, // balance after transaction
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
