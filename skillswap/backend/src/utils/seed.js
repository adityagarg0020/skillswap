require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap');
  console.log('Connected to MongoDB');
};

const seedData = async () => {
  await connectDB();
  
  // Clear existing data
  await User.deleteMany({ email: /@skillswap\.test/ });
  
  const mentors = [
    {
      name: 'Arjun Sharma', email: 'arjun@skillswap.test', password: 'test1234',
      role: 'mentor', isMentor: true, isVerified: true,
      bio: 'Full-stack developer with 8 years of experience in React, Node.js, and AWS. Love teaching modern web development.',
      title: 'Senior Full-Stack Engineer | React & Node.js Expert',
      skillsToTeach: [
        { name: 'React.js', level: 'expert', yearsOfExperience: 6 },
        { name: 'Node.js', level: 'expert', yearsOfExperience: 7 },
        { name: 'AWS', level: 'advanced', yearsOfExperience: 4 }
      ],
      skillsToLearn: [{ name: 'Rust', level: 'beginner' }],
      qualification: 'bachelors', yearsOfExperience: 8,
      pricePerMinute: 8, averageRating: 4.9, totalRatings: 47,
      totalSessions: 142, walletBalance: 5000, rankScore: 92,
      badges: [
        { name: 'Top Rated', icon: '🏆', description: 'Maintained 4.8+ rating' },
        { name: '50 Sessions', icon: '⭐', description: 'Completed 50 sessions' },
        { name: 'Verified Expert', icon: '✅', description: 'Verified by SkillSwap team' }
      ]
    },
    {
      name: 'Priya Patel', email: 'priya@skillswap.test', password: 'test1234',
      role: 'mentor', isMentor: true, isVerified: true,
      bio: 'Machine Learning engineer and data scientist. Specializing in Python, TensorFlow, and production ML systems.',
      title: 'ML Engineer | Python & Data Science',
      skillsToTeach: [
        { name: 'Python', level: 'expert', yearsOfExperience: 5 },
        { name: 'Machine Learning', level: 'expert', yearsOfExperience: 4 },
        { name: 'TensorFlow', level: 'advanced', yearsOfExperience: 3 }
      ],
      skillsToLearn: [{ name: 'React.js', level: 'beginner' }],
      qualification: 'masters', yearsOfExperience: 5,
      pricePerMinute: 10, averageRating: 4.8, totalRatings: 31,
      totalSessions: 89, walletBalance: 8000, rankScore: 88,
      badges: [
        { name: 'Top Rated', icon: '🏆', description: 'Maintained 4.8+ rating' },
        { name: 'Verified Expert', icon: '✅', description: 'Verified by SkillSwap team' }
      ]
    },
    {
      name: 'Rahul Kumar', email: 'rahul@skillswap.test', password: 'test1234',
      role: 'mentor', isMentor: true,
      bio: 'Frontend specialist with expertise in modern CSS, animations, and UI/UX design. Figma to code enthusiast.',
      title: 'Frontend Developer | UI/UX & CSS Expert',
      skillsToTeach: [
        { name: 'CSS', level: 'expert', yearsOfExperience: 4 },
        { name: 'Figma', level: 'expert', yearsOfExperience: 3 },
        { name: 'TypeScript', level: 'advanced', yearsOfExperience: 3 }
      ],
      qualification: 'bachelors', yearsOfExperience: 4,
      pricePerMinute: 6, averageRating: 4.7, totalRatings: 22,
      totalSessions: 54, walletBalance: 2000, rankScore: 75,
      badges: [{ name: '50 Sessions', icon: '⭐', description: 'Completed 50 sessions' }]
    },
    {
      name: 'Sneha Iyer', email: 'sneha@skillswap.test', password: 'test1234',
      role: 'mentor', isMentor: true,
      bio: 'DevOps engineer with deep expertise in Kubernetes, Docker, and CI/CD pipelines. Previously at Flipkart.',
      title: 'DevOps & Cloud Engineer',
      skillsToTeach: [
        { name: 'Kubernetes', level: 'expert', yearsOfExperience: 5 },
        { name: 'Docker', level: 'expert', yearsOfExperience: 6 },
        { name: 'CI/CD', level: 'expert', yearsOfExperience: 5 }
      ],
      qualification: 'masters', yearsOfExperience: 7,
      pricePerMinute: 9, averageRating: 4.6, totalRatings: 18,
      totalSessions: 41, walletBalance: 3500, rankScore: 80
    },
  ];
  
  const testUser = {
    name: 'Test User', email: 'user@skillswap.test', password: 'test1234',
    role: 'user', isMentor: false,
    bio: 'Eager learner looking to upskill in web development and machine learning.',
    skillsToLearn: [
      { name: 'React.js', level: 'beginner' },
      { name: 'Python', level: 'beginner' }
    ],
    walletBalance: 500
  };
  
  const adminUser = {
    name: 'Admin', email: 'admin@skillswap.test', password: 'admin1234',
    role: 'admin', isMentor: false, walletBalance: 0
  };
  
  const created = await User.create([...mentors, testUser, adminUser]);
  
  console.log(`✅ Seeded ${created.length} users`);
  console.log('\n📧 Test Credentials:');
  console.log('  Learner: user@skillswap.test / test1234');
  console.log('  Mentor:  arjun@skillswap.test / test1234');
  console.log('  Admin:   admin@skillswap.test / admin1234\n');
  
  await mongoose.disconnect();
};

seedData().catch(err => {
  console.error(err);
  process.exit(1);
});
