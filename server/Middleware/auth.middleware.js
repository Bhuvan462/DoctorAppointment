const asyncHandler = require('express-async-handler');
const { verifyToken } = require('../utils/generateToken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches authenticated user to req.user
 * Expects token in Authorization header as: Bearer <token>
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // No token provided
  if (!token) {
    return sendError(res, 401, 'Access denied. No authentication token provided.');
  }

  // Verify the token
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Session expired. Please log in again.');
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 401, 'Invalid token. Please log in again.');
    }
    return sendError(res, 401, 'Token verification failed. Please log in again.');
  }

  // Find the user from the decoded token
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    return sendError(res, 401, 'User associated with this token no longer exists.');
  }

  // Check if user account is active
  if (!user.isActive) {
    return sendError(res, 403, 'Your account has been deactivated. Please contact support.');
  }

  // Attach user to request object
  req.user = user;
  next();
});

module.exports = { protect };