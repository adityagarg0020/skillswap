const User = require('../models/User');
const Session = require('../models/Session');
const Transaction = require('../models/Transaction');
const { Booking } = require('../models/ReviewNotificationBooking');

// @GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers, totalMentors, totalSessions, completedSessions,
      totalRevenue, activeUsers, pendingWithdrawals
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ isMentor: true }),
      Session.countDocuments(),
      Session.countDocuments({ status: 'completed' }),
      Transaction.aggregate([
        { $match: { type: 'commission', status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      User.countDocuments({ isOnline: true }),
      Transaction.countDocuments({ type: 'withdrawal', status: 'pending' })
    ]);
    
    // Monthly revenue chart
    const monthlyRevenue = await Transaction.aggregate([
      { $match: { type: 'deposit', status: 'completed', createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$amount' } } },
      { $sort: { '_id': 1 } }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalUsers, totalMentors, totalSessions, completedSessions,
        totalRevenue: totalRevenue[0]?.total || 0,
        activeUsers, pendingWithdrawals
      },
      monthlyRevenue
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isBanned } = req.query;
    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (role) query.role = role;
    if (isBanned !== undefined) query.isBanned = isBanned === 'true';
    
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort('-createdAt').skip(skip).limit(Number(limit)),
      User.countDocuments(query)
    ]);
    
    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/admin/users/:id/ban
const banUser = async (req, res) => {
  try {
    const { ban = true, reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: ban },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user, message: `User ${ban ? 'banned' : 'unbanned'} successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/admin/users/:id/verify
const verifyMentor = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Award verification badge
    if (!user.badges.find(b => b.name === 'Verified Expert')) {
      user.badges.push({ name: 'Verified Expert', icon: '✅', description: 'Verified by SkillSwap team' });
      await user.save({ validateBeforeSave: false });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/admin/sessions
const getAllSessions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;
    
    const [sessions, total] = await Promise.all([
      Session.find(query)
        .populate('mentor', 'name email')
        .populate('learner', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Session.countDocuments(query)
    ]);
    
    res.json({ success: true, sessions, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/admin/transactions
const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('user', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(query)
    ]);
    
    res.json({ success: true, transactions, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/admin/transactions/:id/process
const processWithdrawal = async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    const tx = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status }, // 'completed' or 'failed'
      { new: true }
    );
    res.json({ success: true, transaction: tx });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats, getAllUsers, banUser, verifyMentor, getAllSessions, getAllTransactions, processWithdrawal };
