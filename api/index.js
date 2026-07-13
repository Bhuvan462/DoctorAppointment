require('dotenv').config();
const app = require('../server/app');
const connectDB = require('../server/config/db');
const { configureCloudinary } = require('../server/config/cloudinary');
const nodemailerConfig = require('../server/config/nodemailer');

let isConnected = false;

// Connect to DB and configure services
// This runs once per serverless function instance cold start
if (!isConnected) {
    connectDB().then(() => {
        isConnected = true;
        console.log('Serverless: MongoDB connected');
    }).catch(err => console.error('Serverless DB Error:', err));
    
    configureCloudinary();
    
    if (typeof nodemailerConfig.verifyEmailConnection === 'function') {
        nodemailerConfig.verifyEmailConnection().catch(err => console.warn('Email connection warning:', err.message));
    }
}

module.exports = app;
