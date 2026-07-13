const asyncHandler = require('express-async-handler');
const { cloudinary } = require('../config/cloudinary');
const User = require('../models/User');
const analyticsService = require('../services/analytics.service');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ─── Private Helper ───────────────────────────────────────────────────────────

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer   - File buffer from Multer memory storage
 * @param {string} publicId - Cloudinary public_id
 * @returns {Promise<string>} Secure URL of the uploaded image
 */
const uploadBufferToCloudinary = (buffer, publicId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'medibook/profile_photos',
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @desc    Get the authenticated patient's own profile
 * @route   GET /api/v1/users/profile
 * @access  Private — patient only
 */
const getPatientProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).lean();

  if (!user) {
    return sendError(res, 404, 'User not found.');
  }

  return sendSuccess(res, 200, 'Profile retrieved successfully.', user);
});

/**
 * @desc    Update the authenticated patient's own profile
 * @route   PUT /api/v1/users/profile
 * @access  Private — patient only
 */
const updatePatientProfile = asyncHandler(async (req, res) => {
  // Fields patients are permitted to update
  const allowedFields = [
    'firstName',
    'lastName',
    'phone',
    'dateOfBirth',
    'gender',
    'address',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  if (Object.keys(updates).length === 0) {
    return sendError(res, 400, 'No valid fields provided to update.');
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  ).lean();

  if (!updatedUser) {
    return sendError(res, 404, 'User not found.');
  }

  return sendSuccess(res, 200, 'Profile updated successfully.', updatedUser);
});

/**
 * @desc    Upload / replace the authenticated user's profile photo
 * @route   PUT /api/v1/users/profile/photo
 * @access  Private — any authenticated user
 */
const uploadProfilePhoto = asyncHandler(async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return sendError(res, 400, 'No image file provided.');
  }

  const secureUrl = await uploadBufferToCloudinary(
    req.file.buffer,
    `user_${req.user._id}`
  );

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { profilePhoto: secureUrl } },
    { new: true }
  ).lean();

  if (!updatedUser) {
    return sendError(res, 404, 'User not found.');
  }

  return sendSuccess(res, 200, 'Profile photo updated successfully.', {
    profilePhoto: updatedUser.profilePhoto,
  });
});

/**
 * @desc    Get patient dashboard stats
 * @route   GET /api/v1/users/stats
 * @access  Private — patient only
 */
const getPatientStats = asyncHandler(async (req, res) => {
  if (req.user.role !== 'patient') {
    return sendError(res, 403, 'Access denied. This endpoint is for patients only.');
  }

  const analytics = await analyticsService.getPatientAnalytics(req.user._id);
  return sendSuccess(res, 200, 'Patient statistics retrieved successfully.', analytics);
});

module.exports = {
  getPatientProfile,
  updatePatientProfile,
  uploadProfilePhoto,
  getPatientStats,
};
