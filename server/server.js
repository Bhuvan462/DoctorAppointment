require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const { configureCloudinary } = require('./config/cloudinary');

const nodemailerConfig = require('./config/nodemailer');
const { verifyEmailConnection } = nodemailerConfig;

const { initializeSchedulers } = require('./services/scheduler.service');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    configureCloudinary();

    if (typeof verifyEmailConnection === 'function') {
      await verifyEmailConnection();
    } else {
      console.warn('⚠️ Email connection check skipped — verifyEmailConnection not configured.');
    }

    const server = app.listen(PORT, () => {
      console.log('');
      console.log('═══════════════════════════════════════════════');
      console.log('🏥 MediBook Server Started');
      console.log(`Server: http://localhost:${PORT}`);
      console.log(`API: http://localhost:${PORT}/api/v1`);
      console.log('═══════════════════════════════════════════════');
      console.log('');
    });

    if (typeof initializeSchedulers === 'function') {
      initializeSchedulers();
    }

    process.on('SIGINT', () => {
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
};

startServer();