const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas
 * Implements retry logic and connection event logging
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options ensure stable connection
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Connection event listeners
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully.');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    // Exit process with failure code — let process manager restart
    // In Vercel serverless, process.exit(1) crashes the lambda container and throws a 500 error.
    // Instead, we throw the error so the request can handle it gracefully.
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

module.exports = connectDB;