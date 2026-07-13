const express = require('express');
const router = express.Router();

const {
  approveDoctor,
  rejectDoctor,
  getAllDoctorsAdmin,
  getAllUsers,
  getUserById,
  deactivateUser,
  activateUser,
  getAdminStats,
  getAdminReports,
} = require('../controllers/admin.controller');

const { protect } = require('../Middleware/auth.middleware');

// All admin routes require authentication
// Role check is performed inline inside each controller function
router.use(protect);

// ─── Platform Statistics ──────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get platform-wide dashboard statistics
 * @access  Private — admin only
 */
router.get('/stats', getAdminStats);

// ─── Doctor Management ────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/admin/doctors
 * @desc    Get all doctors (approved and pending)
 * @access  Private — admin only
 */
router.get('/doctors', getAllDoctorsAdmin);

/**
 * @route   PATCH /api/v1/admin/doctors/:id/approve
 * @desc    Approve a doctor's account
 * @access  Private — admin only
 */
router.patch('/doctors/:id/approve', approveDoctor);

/**
 * @route   PATCH /api/v1/admin/doctors/:id/reject
 * @desc    Reject a doctor's account
 * @access  Private — admin only
 */
router.patch('/doctors/:id/reject', rejectDoctor);

// ─── User Management ──────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with search, filter, pagination
 * @access  Private — admin only
 */
router.get('/users', getAllUsers);

/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    Get a single user by ID
 * @access  Private — admin only
 */
router.get('/users/:id', getUserById);

/**
 * @route   PATCH /api/v1/admin/users/:id/deactivate
 * @desc    Deactivate a user account
 * @access  Private — admin only
 */
router.patch('/users/:id/deactivate', deactivateUser);

/**
 * @route   PATCH /api/v1/admin/users/:id/activate
 * @desc    Activate a user account
 * @access  Private — admin only
 */
router.patch('/users/:id/activate', activateUser);

// ─── Reports ──────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/v1/admin/reports
 * @desc    Get operational reports
 * @access  Private — admin only
 */
router.get('/reports', getAdminReports);

module.exports = router;