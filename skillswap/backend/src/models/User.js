import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' }
});

const availabilitySchema = new mongoose.Schema({
  day: { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
  startTime: String,
  endTime: String
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  bio: { type: String, maxlength: 500 },
  
  // Profile
  skillsTeach: [skillSchema],
  skillsLearn: [skillSchema],
  yearsOfExperience: { type: Number, default: 0 },
  qualification: { type: String },
  certificates: [{ name: String, url: String }],
  githubLink: String,
  linkedinLink: String,
  portfolio: String,
  
  // Mentor settings
  isMentor: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  pricePerMinute: { type: Number, default: 5 },
  availability: [availabilitySchema],
  
  // Stats
  totalSessions: { type: Number, default: 0 },
  completedSessions: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  responseTime: { type: Number, default: 0 }, // minutes
  
  // Ranking score (computed)
  rankScore: { type: Number, default: 0 },
  
  // Gamification
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ type: String }],
  
  // Referral
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Status
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  
  // Preferences
  darkMode: { type: Boolean, default: true },
  emailNotifications: { type: Boolean, default: true },
  
  googleId: String,
}, { timestamps: true });

// Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generate referral code
userSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Compute rank score
userSchema.methods.computeRankScore = function() {
  const expScore = Math.min(this.yearsOfExperience * 5, 50);
  const qualScore = { 'PhD': 20, 'Masters': 15, 'Bachelors': 10, 'Diploma': 5 }[this.qualification] || 0;
  const ratingScore = this.rating * 10;
  const sessionScore = Math.min(this.completedSessions * 0.5, 30);
  const responseScore = Math.max(0, 10 - this.responseTime * 0.5);
  const verifiedBonus = this.isVerified ? 15 : 0;
  this.rankScore = expScore + qualScore + ratingScore + sessionScore + responseScore + verifiedBonus;
  return this.rankScore;
};

export default mongoose.model('User', userSchema);
