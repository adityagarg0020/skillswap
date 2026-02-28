# 🎓 SkillSwap — Production-Ready Peer Learning Platform

A complete full-stack platform where users can learn and teach skills via real-time chat and paid video sessions at ₹5/minute.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js (ES modules) |
| Database | MongoDB + Mongoose |
| Real-Time | Socket.io |
| Video | Agora RTC SDK |
| Payments | Razorpay |
| Auth | JWT + bcryptjs |
| UI Style | Dark Glassmorphism |

---

## Project Structure

```
skillswap/
├── backend/
│   ├── server.js              # Entry point
│   ├── src/
│   │   ├── config/db.js       # MongoDB connection
│   │   ├── controllers/       # Business logic
│   │   │   ├── authController.js
│   │   │   ├── mentorController.js
│   │   │   ├── sessionController.js
│   │   │   ├── chatController.js
│   │   │   ├── walletController.js
│   │   │   └── videoController.js
│   │   ├── middleware/
│   │   │   └── auth.js        # JWT protect + adminOnly
│   │   ├── models/
│   │   │   ├── User.js        # User + mentor schema
│   │   │   ├── Message.js     # Chat messages
│   │   │   ├── Conversation.js
│   │   │   ├── Session.js     # Video sessions
│   │   │   ├── Booking.js     # Scheduled bookings
│   │   │   ├── Transaction.js # Payment records
│   │   │   ├── Wallet.js      # User wallets
│   │   │   ├── Review.js      # Star ratings
│   │   │   └── Notification.js
│   │   ├── routes/            # Express routers
│   │   ├── socket/index.js    # Socket.io events
│   │   └── utils/             # JWT, notifications
└── frontend/
    ├── src/
    │   ├── pages/             # Route-level components
    │   │   ├── Landing.jsx    # Marketing homepage
    │   │   ├── Login.jsx / Signup.jsx
    │   │   ├── Dashboard.jsx  # User hub
    │   │   ├── Mentors.jsx    # Search & filter
    │   │   ├── MentorProfile.jsx
    │   │   ├── Chat.jsx       # Real-time messaging
    │   │   ├── VideoCall.jsx  # Agora video room
    │   │   ├── Wallet.jsx     # Razorpay + transactions
    │   │   ├── Bookings.jsx   # Session scheduler
    │   │   ├── Profile.jsx / EditProfile.jsx
    │   │   ├── Settings.jsx
    │   │   └── AdminPanel.jsx
    │   ├── components/
    │   │   ├── common/MentorCard.jsx
    │   │   └── layout/Sidebar.jsx + Topbar.jsx + Layout.jsx
    │   ├── store/authStore.js  # Zustand global state
    │   └── services/api.js + socket.js
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free) or local MongoDB
- Agora account (free tier available)
- Razorpay account (test mode)

### 1. Clone and install

```bash
git clone <your-repo>
cd skillswap

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/skillswap
JWT_SECRET=your-super-secret-key-here-min-32-chars
JWT_EXPIRE=7d
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
CLIENT_URL=http://localhost:5173
```

### 3. Configure Frontend Environment

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Add Razorpay script to `frontend/index.html`

Add before `</head>`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### 5. Run the app

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Open http://localhost:5173

---

## Razorpay Setup

1. Sign up at https://razorpay.com
2. Go to Dashboard → API Keys → Generate Test Key
3. Copy `Key ID` and `Key Secret` into backend `.env`
4. Test payments use card: `4111 1111 1111 1111`, any future date, any CVV

---

## Agora Video Setup

1. Sign up at https://agora.io
2. Create a new project (choose "Testing mode" to skip certificate)
3. Copy App ID → backend `.env` `AGORA_APP_ID`
4. For production: enable App Certificate and set `AGORA_APP_CERTIFICATE`
5. In testing mode, skip token generation — pass empty string as token

---

## MongoDB Setup

1. Sign up at https://mongodb.com/atlas
2. Create free M0 cluster
3. Add database user and whitelist your IP
4. Copy connection string to `MONGO_URI`

---

## API Routes Reference

```
POST   /api/auth/signup          Sign up
POST   /api/auth/login           Login
GET    /api/auth/me              Get current user

GET    /api/mentors              Search mentors (filters: skill, minExp, maxExp, minPrice, maxPrice, minRating, sort)
GET    /api/mentors/recommendations  AI recommendations
GET    /api/mentors/:id          Mentor + reviews

PUT    /api/users/profile        Update profile
GET    /api/users/:id            Get user

POST   /api/sessions/start       Start video session
POST   /api/sessions/:id/end     End session + auto-charge
GET    /api/sessions             User session history

GET    /api/chat/conversations   All conversations
GET    /api/chat/conversation/:userId  Get or create with user
GET    /api/chat/messages/:convId     Message history

GET    /api/wallet               Balance + transactions
POST   /api/wallet/order         Create Razorpay order
POST   /api/wallet/verify        Verify payment + credit wallet

POST   /api/bookings             Create booking request
GET    /api/bookings             User's bookings
PATCH  /api/bookings/:id/status  Accept/reject booking

POST   /api/reviews              Post review after session
GET    /api/reviews/mentor/:id   Mentor reviews

GET    /api/notifications        User notifications
PATCH  /api/notifications/read-all  Mark all read

POST   /api/video/token          Get Agora RTC token

GET    /api/admin/stats          Platform stats (admin only)
GET    /api/admin/users          All users
PATCH  /api/admin/users/:id/ban  Ban/unban user
PATCH  /api/admin/users/:id/verify-mentor  Verify mentor
```

---

## Socket.io Events

```
Client → Server:
  join(userId)                  Connect and go online
  join_conversation(convId)     Enter chat room
  send_message({conversationId, content, type})
  typing({conversationId, isTyping})
  call_request({targetUserId, sessionId, channelName})
  call_accepted({targetUserId, channelName})
  call_ended({targetUserId})

Server → Client:
  new_message(message)          New chat message
  typing({userId, isTyping})    Typing indicator
  user_online(userId)           User came online
  user_offline(userId)          User went offline
  notification(notification)    Push notification
  incoming_call({from, channelName})
  call_accepted({channelName})
  call_ended
```

---

## Mentor Ranking Algorithm

```javascript
rankScore = 
  min(yearsOfExperience × 5, 50)    // max 50 points
  + qualificationScore               // PhD=20, Masters=15, Bachelors=10, Diploma=5
  + rating × 10                      // max 50 points
  + min(completedSessions × 0.5, 30) // max 30 points
  + max(0, 10 - responseTime × 0.5)  // up to 10 points
  + 15 (if verified)                 // verification bonus
```

---

## Billing Logic

- ₹5/minute (configurable per mentor via `pricePerMinute`)
- Deducted from learner wallet every second (client-side estimate)
- **True billing**: calculated server-side on `endSession` — `ceil(durationMs / 60000)` minutes
- Platform commission: 15% (configurable via `PLATFORM_COMMISSION`)
- Mentor earns 85% of session cost
- Auto-disconnect when balance < 5 min worth

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Deploy dist/ to Vercel
# Set VITE_API_URL to your Render backend URL
```

### Backend → Render

1. Push to GitHub
2. Create Render Web Service → connect repo
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all environment variables in Render dashboard
6. Set NODE_ENV=production

---

## Sample Test Data (seed script)

```javascript
// Run: node seed.js from backend/
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Wallet from './src/models/Wallet.js';

await mongoose.connect(process.env.MONGO_URI);

const mentor = await User.create({
  name: 'Rahul Sharma',
  email: 'mentor@test.com',
  password: 'password123',
  isMentor: true,
  bio: 'Full-stack developer with 5 years of experience',
  skillsTeach: [
    { name: 'React', level: 'expert' },
    { name: 'Node.js', level: 'advanced' },
    { name: 'MongoDB', level: 'advanced' }
  ],
  yearsOfExperience: 5,
  qualification: 'Bachelors',
  pricePerMinute: 5,
  rating: 4.8,
  totalRatings: 25,
  completedSessions: 50,
});
mentor.computeRankScore();
await mentor.save();
await Wallet.create({ user: mentor._id, balance: 500 });

const learner = await User.create({
  name: 'Priya Singh',
  email: 'learner@test.com',
  password: 'password123',
  skillsLearn: [{ name: 'React', level: 'beginner' }],
});
await Wallet.create({ user: learner._id, balance: 1000 });

console.log('Seed complete! mentor@test.com / learner@test.com — password: password123');
process.exit(0);
```

---

## Security Features

- JWT authentication with 7-day expiry
- bcrypt password hashing (salt rounds: 12)
- Helmet.js security headers
- Rate limiting: 100 requests per 15 minutes per IP
- Role-based access control (user / admin)
- Input validation via express-validator
- CORS restricted to CLIENT_URL
- Server-side session billing (cannot be spoofed)

---

## Unique Features

1. **AI Mentor Matching** — Skill intersection + rank scoring for recommendations
2. **Real-time Balance Drain** — Live counter during video with auto-disconnect
3. **Gamification** — Auto-awarded badges on milestones via server-side checks
4. **Referral System** — ₹50 bonus on signup via referral code
5. **Mentor Ranking** — Multi-factor score: exp + qual + rating + sessions + response time
6. **Verified Mentors** — Admin-reviewed badge with ranking bonus
7. **Micro-session Summaries** — Stored per session for learner review
