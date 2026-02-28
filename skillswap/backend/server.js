import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './src/config/db.js';
import { initSocket } from './src/socket/index.js';

// Routes
import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/users.js';
import mentorRoutes from './src/routes/mentors.js';
import sessionRoutes from './src/routes/sessions.js';
import chatRoutes from './src/routes/chat.js';
import walletRoutes from './src/routes/wallet.js';
import bookingRoutes from './src/routes/bookings.js';
import reviewRoutes from './src/routes/reviews.js';
import notificationRoutes from './src/routes/notifications.js';
import adminRoutes from './src/routes/admin.js';
import videoRoutes from './src/routes/video.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect DB
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/api/', limiter);

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/video', videoRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Init Socket.io
initSocket(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 SkillSwap Server running on port ${PORT}`);
});
