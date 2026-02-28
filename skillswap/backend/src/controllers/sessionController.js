import Session from '../models/Session.js';
import Wallet from '../models/Wallet.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { createNotification } from '../utils/notify.js';

const PLATFORM_COMMISSION = 0.15;

export const startSession = async (req, res) => {
  try {
    const { mentorId, bookingId } = req.body;
    const io = req.app.get('io');

    // Check learner has sufficient balance (at least 10 min worth)
    const wallet = await Wallet.findOne({ user: req.user._id });
    const mentor = await User.findById(mentorId);
    
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found' });
    
    const minBalance = mentor.pricePerMinute * 5; // at least 5 min
    if (wallet.balance < minBalance) {
      return res.status(400).json({ success: false, message: `Insufficient balance. Need at least ₹${minBalance}` });
    }

    const channelName = `skillswap_${req.user._id}_${mentorId}_${Date.now()}`;

    const session = await Session.create({
      mentor: mentorId,
      learner: req.user._id,
      booking: bookingId,
      startTime: new Date(),
      pricePerMinute: mentor.pricePerMinute,
      agoraChannelName: channelName,
    });

    await createNotification(io, {
      userId: mentorId,
      type: 'session',
      title: 'Session Started',
      message: `${req.user.name} has started a session with you`,
      data: { sessionId: session._id }
    });

    res.json({ success: true, session, channelName });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const io = req.app.get('io');
    
    const session = await Session.findById(sessionId).populate('mentor learner');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const endTime = new Date();
    const durationMs = endTime - session.startTime;
    const duration = Math.ceil(durationMs / 60000); // minutes, round up

    const totalCost = duration * session.pricePerMinute;
    const platformFee = totalCost * PLATFORM_COMMISSION;
    const mentorEarning = totalCost - platformFee;

    // Debit learner
    const learnerWallet = await Wallet.findOneAndUpdate(
      { user: session.learner._id },
      { $inc: { balance: -totalCost, totalSpent: totalCost } },
      { new: true }
    );

    // Credit mentor
    const mentorWallet = await Wallet.findOneAndUpdate(
      { user: session.mentor._id },
      { $inc: { balance: mentorEarning, totalEarned: mentorEarning, withdrawable: mentorEarning } },
      { new: true }
    );

    // Record transactions
    await Transaction.create([
      { user: session.learner._id, type: 'debit', amount: totalCost, description: `Video session with ${session.mentor.name} (${duration} min)`, session: session._id, balance: learnerWallet.balance },
      { user: session.mentor._id, type: 'credit', amount: mentorEarning, description: `Earnings from session with ${session.learner.name} (${duration} min)`, session: session._id, balance: mentorWallet.balance }
    ]);

    // Update session
    session.endTime = endTime;
    session.duration = duration;
    session.totalCost = totalCost;
    session.platformFee = platformFee;
    session.mentorEarning = mentorEarning;
    session.status = 'completed';
    await session.save();

    // Update user stats
    await User.findByIdAndUpdate(session.mentor._id, { $inc: { completedSessions: 1, totalSessions: 1 } });
    await User.findByIdAndUpdate(session.learner._id, { $inc: { totalSessions: 1 } });

    // Check badges
    await checkAndAwardBadges(session.mentor._id, io);

    await createNotification(io, {
      userId: session.learner._id,
      type: 'payment',
      title: 'Session Completed',
      message: `₹${totalCost} deducted for ${duration} min session with ${session.mentor.name}`,
      data: { sessionId: session._id, amount: totalCost }
    });

    res.json({ success: true, session, summary: { duration, totalCost, mentorEarning, platformFee } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

async function checkAndAwardBadges(mentorId, io) {
  const mentor = await User.findById(mentorId);
  const badges = new Set(mentor.badges);
  
  if (mentor.completedSessions >= 1 && !badges.has('first_session')) badges.add('first_session');
  if (mentor.completedSessions >= 10 && !badges.has('ten_sessions')) badges.add('ten_sessions');
  if (mentor.completedSessions >= 50 && !badges.has('50_sessions')) badges.add('50_sessions');
  if (mentor.rating >= 4.8 && mentor.totalRatings >= 5 && !badges.has('top_rated')) badges.add('top_rated');

  if (badges.size !== mentor.badges.length) {
    mentor.badges = [...badges];
    await mentor.save({ validateBeforeSave: false });
    await createNotification(io, {
      userId: mentorId,
      type: 'badge',
      title: 'New Badge Earned! 🏆',
      message: 'You earned a new achievement badge!'
    });
  }
}

export const getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ mentor: req.user._id }, { learner: req.user._id }]
    }).populate('mentor learner', 'name avatar').sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
