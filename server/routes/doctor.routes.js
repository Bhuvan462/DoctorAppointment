const express = require('express');
const router = express.Router();

const {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorById,
  getAllDoctors,
  getDoctorStats,
} = require('../controllers/doctor.controller');

const { protect } = require('../Middleware/auth.middleware');
const { handleProfilePhotoUpload } = require('../Middleware/upload.middleware');

// ─── All doctor routes require authentication ─────────────────────────────────
router.use(protect);

// ─── Doctor-specific routes (must come before /:id to avoid conflict) ─────────

/**
 * @route   GET /api/v1/doctors/stats
 * @desc    Get logged-in doctor's dashboard statistics
 * @access  Private — doctor only
 */
router.get('/stats', getDoctorStats);

/**
 * @route   GET /api/v1/doctors/profile
 * @desc    Get logged-in doctor's own full profile
 * @access  Private — doctor only
 */
router.get('/profile', getDoctorProfile);

/**
 * @route   PUT /api/v1/doctors/profile
 * @desc    Update logged-in doctor's own profile (with optional photo)
 * @access  Private — doctor only
 */
router.put('/profile', handleProfilePhotoUpload, updateDoctorProfile);

// ─── Public-facing doctor routes ──────────────────────────────────────────────

/**
 * @route   GET /api/v1/doctors
 * @desc    Get all doctors with search, filter, sort, pagination
 * @access  Private — any authenticated user
 */
router.get('/', getAllDoctors);

/**
 * @route   GET /api/v1/doctors/:id
 * @desc    Get a single doctor's public profile by User ID
 * @access  Private — any authenticated user
 */
router.get('/:id', getDoctorById);

module.exports = router;