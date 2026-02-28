import User from '../models/User.js';
import Review from '../models/Review.js';

// GET /api/mentors - search & filter mentors with ranking
export const getMentors = async (req, res) => {
  try {
    const { skill, minExp, maxExp, minPrice, maxPrice, minRating, sort, page = 1, limit = 12 } = req.query;

    const filter = { isMentor: true, isActive: true, isBanned: false };

    if (skill) filter['skillsTeach.name'] = { $regex: skill, $options: 'i' };
    if (minExp || maxExp) filter.yearsOfExperience = {};
    if (minExp) filter.yearsOfExperience.$gte = Number(minExp);
    if (maxExp) filter.yearsOfExperience.$lte = Number(maxExp);
    if (minPrice || maxPrice) filter.pricePerMinute = {};
    if (minPrice) filter.pricePerMinute.$gte = Number(minPrice);
    if (maxPrice) filter.pricePerMinute.$lte = Number(maxPrice);
    if (minRating) filter.rating = { $gte: Number(minRating) };

    const sortMap = {
      'rank': { rankScore: -1 },
      'rating': { rating: -1 },
      'price_asc': { pricePerMinute: 1 },
      'price_desc': { pricePerMinute: -1 },
      'sessions': { completedSessions: -1 },
      'newest': { createdAt: -1 }
    };
    const sortOption = sortMap[sort] || { rankScore: -1 };

    const skip = (page - 1) * limit;
    const [mentors, total] = await Promise.all([
      User.find(filter).sort(sortOption).skip(skip).limit(Number(limit))
        .select('-password -googleId'),
      User.countDocuments(filter)
    ]);

    res.json({ success: true, mentors, total, pages: Math.ceil(total / limit), page: Number(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/mentors/:id
export const getMentorById = async (req, res) => {
  try {
    const mentor = await User.findById(req.params.id).select('-password -googleId');
    if (!mentor || !mentor.isMentor) return res.status(404).json({ success: false, message: 'Mentor not found' });
    
    const reviews = await Review.find({ mentor: mentor._id })
      .populate('learner', 'name avatar')
      .sort({ createdAt: -1 }).limit(10);

    res.json({ success: true, mentor, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// AI Recommendation: recommend mentors based on user's skills to learn + past sessions
export const getRecommendations = async (req, res) => {
  try {
    const user = req.user;
    const learnSkills = user.skillsLearn?.map(s => s.name) || [];

    let mentors = [];
    if (learnSkills.length > 0) {
      mentors = await User.find({
        isMentor: true,
        isActive: true,
        isBanned: false,
        _id: { $ne: user._id },
        'skillsTeach.name': { $in: learnSkills.map(s => new RegExp(s, 'i')) }
      }).sort({ rankScore: -1 }).limit(6).select('-password');
    }

    // Fallback: top ranked mentors
    if (mentors.length < 3) {
      const topMentors = await User.find({
        isMentor: true, isActive: true, isBanned: false, _id: { $ne: user._id }
      }).sort({ rankScore: -1 }).limit(6).select('-password');
      
      const existingIds = new Set(mentors.map(m => m._id.toString()));
      mentors = [...mentors, ...topMentors.filter(m => !existingIds.has(m._id.toString()))].slice(0, 6);
    }

    res.json({ success: true, mentors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
