const User = require('../models/User');

// @GET /api/search/mentors
const searchMentors = async (req, res) => {
  try {
    const {
      skill, minExperience, maxExperience,
      minPrice, maxPrice, minRating,
      availability, sortBy = 'rankScore',
      page = 1, limit = 12
    } = req.query;
    
    const query = {
      isMentor: true,
      isActive: true,
      isBanned: false,
    };
    
    // Skill search (case-insensitive)
    if (skill) {
      query['skillsToTeach.name'] = { $regex: skill, $options: 'i' };
    }
    
    // Experience range
    if (minExperience || maxExperience) {
      query.yearsOfExperience = {};
      if (minExperience) query.yearsOfExperience.$gte = Number(minExperience);
      if (maxExperience) query.yearsOfExperience.$lte = Number(maxExperience);
    }
    
    // Price range
    if (minPrice || maxPrice) {
      query.pricePerMinute = {};
      if (minPrice) query.pricePerMinute.$gte = Number(minPrice);
      if (maxPrice) query.pricePerMinute.$lte = Number(maxPrice);
    }
    
    // Rating filter
    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }
    
    // Availability filter
    if (availability) {
      query['availability.day'] = availability.toLowerCase();
      query['availability.isAvailable'] = true;
    }
    
    // Sort options
    const sortOptions = {
      rankScore: { rankScore: -1 },
      rating: { averageRating: -1 },
      price_low: { pricePerMinute: 1 },
      price_high: { pricePerMinute: -1 },
      sessions: { totalSessions: -1 },
      newest: { createdAt: -1 }
    };
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [mentors, total] = await Promise.all([
      User.find(query)
        .select('-password -walletBalance -notificationPrefs')
        .sort(sortOptions[sortBy] || { rankScore: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      mentors,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/search/skills - autocomplete skill suggestions
const getSkillSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ success: true, skills: [] });
    
    const results = await User.aggregate([
      { $unwind: '$skillsToTeach' },
      { $match: { 'skillsToTeach.name': { $regex: q, $options: 'i' } } },
      { $group: { _id: '$skillsToTeach.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);
    
    res.json({ success: true, skills: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { searchMentors, getSkillSuggestions };
