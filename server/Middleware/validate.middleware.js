const { validationResult } = require('express-validator');
const { sendError } = require('../utils/apiResponse');

/**
 * Validation Middleware
 * Collects errors from express-validator chains and returns
 * a formatted error response if any validation errors exist.
 *
 * Must be placed AFTER the express-validator chain in the route definition.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format errors into a clean array
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    return sendError(res, 422, 'Validation failed. Please check your input.', formattedErrors);
  }

  next();
};

module.exports = { validate };