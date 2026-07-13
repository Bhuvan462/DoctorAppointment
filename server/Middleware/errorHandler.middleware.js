const { sendError } = require('../utils/apiResponse');

/**
 * Global Error Handler Middleware
 * Must be the LAST middleware registered in app.js
 * Catches all errors passed via next(error) or thrown in async handlers
 */
const errorHandler = (err, req, res, next) => {
  // Log the error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
  } else {
    console.error(`❌ Error: ${err.message}`);
  }

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // --- Mongoose Validation Error ---
  if (err.name === 'ValidationError') {
    statusCode = 422;
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, statusCode, 'Validation failed.', errors);
  }

  // --- Mongoose Duplicate Key Error (e.g., duplicate email) ---
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    message = `An account with this ${field} (${value}) already exists.`;
    return sendError(res, statusCode, message);
  }

  // --- Mongoose CastError (invalid ObjectId) ---
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field: ${err.path}. Please provide a valid ID.`;
    return sendError(res, statusCode, message);
  }

  // --- JWT Errors (should be caught in middleware, but as a safety net) ---
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
    return sendError(res, statusCode, message);
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Session expired. Please log in again.';
    return sendError(res, statusCode, message);
  }

  // --- Multer Errors ---
  if (err.name === 'MulterError') {
    statusCode = 400;
    message = `File upload error: ${err.message}`;
    return sendError(res, statusCode, message);
  }

  // --- Generic server error ---
  // In production, hide internal error details from the client
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'An unexpected error occurred. Please try again later.';
  }

  return sendError(res, statusCode, message);
};

/**
 * 404 Not Found Handler
 * Catches requests to undefined routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { errorHandler, notFound };