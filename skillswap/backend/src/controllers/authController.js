import User from '../models/User.js';
import Wallet from '../models/Wallet.js';
import { sendTokenResponse } from '../utils/jwt.js';

export const signup = async (req, res) => {
  try {
    const { name, email, password, isMentor, referralCode } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) referredBy = referrer._id;
    }

    const user = await User.create({ name, email, password, isMentor: isMentor || false, referredBy });
    
    // Create wallet
    await Wallet.create({ user: user._id, balance: referredBy ? 50 : 0 }); // ₹50 bonus on referral

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (user.isBanned) return res.status(403).json({ success: false, message: 'Account banned. Contact support.' });

    user.isOnline = true;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const wallet = await Wallet.findOne({ user: req.user._id });
    res.json({ success: true, user, wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isOnline: false, lastSeen: new Date() });
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
