require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const { initializeSocket } = require('./socket');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const sessionRoutes = require('./routes/sessions');
const chatRoutes = require('./routes/chat');
const walletRoutes = require('./routes/wallet');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const searchRoutes = require('./routes/search');
const videoRoutes = require('./routes/video');

const app = express();
const server = http.createServer(app);

// Connect to database
connectDB();

// Initialize Socket.io
initializeSocket(server);

// Security middleware
app.use(helmet({ crossOriginEmbedderPolicy: false }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many auth attempts, please try again later.'
});

//app.use('/api/', limiter);
app.use('/api/auth', authLimiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/video', videoRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 SkillSwap Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}\n`);
});

module.exports = { app, server };
