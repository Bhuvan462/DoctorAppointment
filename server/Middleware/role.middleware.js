const { sendError } = require('../utils/apiResponse');

/**
 * Role Authorization Middleware
 * Restricts access to routes based on user role
 * Must be used AFTER the protect middleware
 *
 * Usage: authorize('admin') or authorize('doctor', 'admin')
 *
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware function
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user is set by the protect middleware
    if (!req.user) {
      return sendError(res, 401, 'Authentication required before authorization check.');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. This action requires one of the following roles: ${roles.join(', ')}. Your current role is: ${req.user.role}.`
      );
    }

    next();
  };
};

/**
 * Ownership check middleware factory
 * Verifies that the requesting user owns the resource or is an admin
 * Used for operations like editing own profile only
 *
 * @param {string} paramName - The req.params key containing the resource owner's userId
 * @returns {Function} Express middleware function
 */
const authorizeOwnerOrAdmin = (paramName = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required.');
    }

    const resourceUserId = req.params[paramName];
    const requestingUserId = req.user._id.toString();
    const requestingUserRole = req.user.role;

    // Admins can access any resource
    if (requestingUserRole === 'admin') {
      return next();
    }

    // Users can only access their own resources
    if (resourceUserId && resourceUserId === requestingUserId) {
      return next();
    }

    return sendError(res, 403, 'Access denied. You do not have permission to access this resource.');
  };
};

module.exports = { authorize, authorizeOwnerOrAdmin };