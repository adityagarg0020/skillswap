//import Razorpay from 'razorpay';
import crypto from 'crypto';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';

//const razorpay = new Razorpay({
 // key_id: process.env.RAZORPAY_KEY_ID,
  //key_secret: process.env.RAZORPAY_KEY_SECRET
//});

export const getWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(20)
      .populate('session', 'startTime endTime duration');
    res.json({ success: true, wallet, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees
    if (amount < 10) return res.status(400).json({ success: false, message: 'Minimum ₹10 required' });

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: `skillswap_${req.user._id}_${Date.now()}`,
    });

    res.json({ success: true, order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = hmac.digest('hex');

    if (digest !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Credit wallet
    const wallet = await Wallet.findOneAndUpdate(
      { user: req.user._id },
      { $inc: { balance: amount, totalEarned: amount } },
      { new: true }
    );

    await Transaction.create({
      user: req.user._id,
      type: 'credit',
      amount,
      description: 'Wallet top-up via Razorpay',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      status: 'success',
      balance: wallet.balance
    });

    res.json({ success: true, wallet, message: `₹${amount} added to wallet` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
