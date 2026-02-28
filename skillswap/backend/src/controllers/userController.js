const User = require('../models/User');
const Session = require('../models/Session');
const { Review } = require('../models/ReviewNotificationBooking');

// @GET /api/users/:id
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -walletBalance');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Get recent reviews
    const reviews = await Review.find({ reviewee: user._id, isPublic: true })
      .populate('reviewer', 'name avatar')
      .sort('-createdAt')
      .limit(10);
    
    res.json({ success: true, user, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name', 'bio', 'title', 'skillsToTeach', 'skillsToLearn',
      'qualification', 'yearsOfExperience', 'github', 'linkedin',
      'portfolio', 'pricePerMinute', 'isMentor', 'availability', 'theme',
      'notificationPrefs'
    ];
    
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    
    // Update role if becoming mentor
    if (updates.isMentor) updates.role = 'mentor';
    
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true, runValidators: true
    }).select('-password');
    
    // Recalculate rank score
    user.calculateRankScore();
    await user.save({ validateBeforeSave: false });
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/users/avatar
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path },
      { new: true }
    ).select('-password');
    
    res.json({ success: true, user, avatarUrl: req.file.path });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/users/certificates
const uploadCertificate = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    
    const cert = {
      name: req.body.name || 'Certificate',
      url: req.file.path,
      issuedBy: req.body.issuedBy,
      year: req.body.year
    };
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { certificates: cert } },
      { new: true }
    ).select('-password');
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/users/mentors/recommended
const getRecommendedMentors = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    // AI/Heuristic recommendation based on skills to learn
    const wantedSkills = currentUser.skillsToLearn.map(s => s.name);
    
    // Find mentors who teach skills the user wants to learn
    let query = {
      isMentor: true,
      isActive: true,
      isBanned: false,
      _id: { $ne: req.user._id }
    };
    
    if (wantedSkills.length > 0) {
      query['skillsToTeach.name'] = { $in: wantedSkills };
    }
    
    // Get previously sessioned mentors to boost their ranking
    const previousMentors = await Session.distinct('mentor', { learner: req.user._id, status: 'completed' });
    
    const mentors = await User.find(query)
      .select('-password -walletBalance')
      .sort({ rankScore: -1, averageRating: -1 })
      .limit(10);
    
    // Boost mentors previously worked with
    const boostedMentors = mentors.map(m => {
      const obj = m.toObject();
      obj.isReturning = previousMentors.some(pm => pm.toString() === m._id.toString());
      obj.matchScore = calculateMatchScore(m, wantedSkills);
      return obj;
    }).sort((a, b) => b.matchScore - a.matchScore);
    
    res.json({ success: true, mentors: boostedMentors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: Calculate match score between mentor and user's wanted skills
const calculateMatchScore = (mentor, wantedSkills) => {
  let score = mentor.rankScore || 0;
  const mentorSkills = mentor.skillsToTeach.map(s => s.name.toLowerCase());
  const matches = wantedSkills.filter(s => mentorSkills.includes(s.toLowerCase()));
  score += matches.length * 20; // +20 per matching skill
  return score;
};

// @GET /api/users/stats
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const [totalSessions, completedSessions, upcomingSessions] = await Promise.all([
      Session.countDocuments({ $or: [{ mentor: userId }, { learner: userId }] }),
      Session.countDocuments({ $or: [{ mentor: userId }, { learner: userId }], status: 'completed' }),
      Session.countDocuments({ $or: [{ mentor: userId }, { learner: userId }], status: 'scheduled', scheduledAt: { $gte: new Date() } })
    ]);
    
    res.json({
      success: true,
      stats: { totalSessions, completedSessions, upcomingSessions }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUserProfile, updateProfile, updateAvatar, uploadCertificate, getRecommendedMentors, getUserStats };
