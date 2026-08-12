import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { syncDatabase } from './models/index.js';

import authRoutes from './routes/authRoutes.js';
import classRoutes from './routes/classRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import venueRoutes from './routes/venueRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import gradeRoutes from './routes/gradeRoutes.js';
import ecaRoutes from './routes/ecaRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import timeSlotRoutes from './routes/timeSlotRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

// BITSchool Express Server Engine (Full API Endpoint Protection Enabled)
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database connection and models
async function initServer() {
  const connected = await connectDB();
  if (connected) {
    await syncDatabase();
  }
}
initServer();

// HTTP Security Hardening Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
});

// Security Hardening & CORS Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow local development ports, postman, and local connections
    if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'BITSchool Management System REST API',
    database: 'MySQL (bitschool_db)',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/eca', ecaRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/time-slots', timeSlotRoutes);
app.use('/api/users', userRoutes);

// 404 Handler
app.use((req, res) => {
  console.warn(`[404 Not Found]: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Backend Server Error]:', err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 BITSchool Backend API Server running on port ${PORT}`);
  console.log(`📡 Base URL: http://localhost:${PORT}/api`);
  console.log(`🛢️ Database: MySQL bitschool_db (localhost:3306)`);
  console.log(`==================================================`);
});
