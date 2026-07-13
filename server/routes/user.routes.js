const express = require('express');
const router = express.Router();
const { protect } = require('../Middleware/auth.middleware');
const { handleProfilePhotoUpload } = require('../Middleware/upload.middleware');
const {
  getPatientProfile,
  updatePatientProfile,
  uploadProfilePhoto,
  getPatientStats,
} = require('../controllers/user.controller');

// All user routes require authentication
router.use(protect);

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get the authenticated user's own profile
 * @access  Private
 */
router.get('/profile', getPatientProfile);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update the authenticated user's own profile
 * @access  Private
 */
router.put('/profile', updatePatientProfile);

/**
 * @route   PUT /api/v1/users/profile/photo
 * @desc    Upload / replace the authenticated user's profile photo
 * @access  Private
 */
router.put('/profile/photo', handleProfilePhotoUpload, uploadProfilePhoto);

/**
 * @route   GET /api/v1/users/stats
 * @desc    Get the authenticated patient's dashboard stats
 * @access  Private
 */
router.get('/stats', getPatientStats);

module.exports = router;
