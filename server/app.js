const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { errorHandler, notFound } = require('./Middleware/errorHandler.middleware');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const doctorRoutes = require('./routes/doctor.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const availabilityRoutes = require('./routes/availability.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const notificationRoutes = require('./routes/notification.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes'); 
const aiRoutes = require('./routes/ai.routes');
const paymentRoutes = require('./routes/payment.routes');
const healthRoutes = require('./routes/health.routes');
const cronRoutes = require('./routes/cron.routes');

const app = express();

// ─── Security Middleware ──────────────────────────────────────────────────────

// Set secure HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'http://localhost:3000',
      ];
      // Allow requests with no origin (e.g., mobile apps, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// Global rate limiter — effectively unlimited for development/internal use
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP address. Please try again after 15 minutes.',
  },
});

// Auth rate limiter — effectively unlimited for development/internal use
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP address. Please try again after 15 minutes.',
  },
});

app.use(globalLimiter);

// ─── General Middleware ───────────────────────────────────────────────────────

// Parse incoming JSON requests (max 10MB body)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compress responses for better performance
app.use(compression());

// HTTP request logger (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check Route ───────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MediBook API is running.',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/availability', availabilityRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/cron', cronRoutes);

// ─── Error Handling ───────────────────────────────────────────────────────────

// Handle undefined routes
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;