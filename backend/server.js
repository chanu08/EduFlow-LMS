const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const db = require('./db');

const app = express();
const port = process.env.PORT || 5000;

// ── CORS ─────────────────────────────────────────────────────────────────────
// Allowlist: local dev frontend + production URL from env (set on Render)
const allowedOrigins = [
  'http://localhost:5173',                 // Vite dev server
  'http://localhost:3000',                 // CRA fallback (just in case)
  process.env.FRONTEND_URL,               // e.g. https://eduflow.vercel.app
].filter(Boolean); // removes undefined if FRONTEND_URL is not set

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS policy: origin ${origin} is not allowed.`));
    },
    credentials: true, // allow cookies / auth headers
  })
);

app.use(helmet());
app.use(express.json());

// Auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Course routes
const courseRoutes = require('./routes/courseRoutes');
app.use('/api/courses', courseRoutes);

// Lesson routes (progress, etc.)
const lessonRoutes = require('./routes/lessonRoutes');
app.use('/api/lessons', lessonRoutes);

// Quiz routes
const quizRoutes = require('./routes/quizRoutes');
app.use('/api/quizzes', quizRoutes);

// User routes (e.g., enrolled courses)
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// Review routes (nested under /api/courses/:courseId/reviews)
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/courses', reviewRoutes);

// AI Tutor routes
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

// Analytics routes
const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/api/analytics', analyticsRoutes);

// Certificate routes (nested under /api/courses/:courseId/certificate)
const certificateRoutes = require('./routes/certificateRoutes');
app.use('/api/courses', certificateRoutes);

// Discussion routes (nested under /api/courses/:courseId/discussions)
const discussionRoutes = require('./routes/discussionRoutes');
app.use('/api/courses', discussionRoutes);

// Notification routes
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);

// Admin routes
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);

// Live session routes (nested under /api/courses/:courseId/sessions)
const liveSessionRoutes = require('./routes/liveSessionRoutes');
app.use('/api/courses', liveSessionRoutes);

// Payment routes
const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.send('EduFlow API is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});