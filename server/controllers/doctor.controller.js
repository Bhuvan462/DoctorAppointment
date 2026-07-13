const asyncHandler = require('express-async-handler');
const { cloudinary } = require('../config/cloudinary');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const AvailabilitySlot = require('../models/AvailabilitySlot');
const ConsultationRecord = require('../models/ConsultationRecord');
const Prescription = require('../models/Prescription');
const analyticsService = require('../services/analytics.service');
const { sendSuccess, sendError, buildPagination } = require('../utils/apiResponse');

// ─── Private Helper ───────────────────────────────────────────────────────────

/**
 * Upload a file buffer to Cloudinary using the already-configured
 * cloudinary instance from config/cloudinary.js.
 * Called only when req.file.buffer is present after handleProfilePhotoUpload.
 *
 * @param {Buffer} buffer   - File buffer from Multer memory storage
 * @param {string} publicId - Cloudinary public_id for the file
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
 * @desc    Get the logged-in doctor's own full profile
 * @route   GET /api/v1/doctors/profile
 * @access  Private — doctor only
 */
const getDoctorProfile = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    return sendError(res, 403, 'Access denied. This endpoint is for doctors only.');
  }

  const doctorProfile = await DoctorProfile.findOne({ userId: req.user._id }).lean();

  if (!doctorProfile) {
    return sendError(res, 404, 'Doctor profile not found. Please contact support.');
  }

  return sendSuccess(res, 200, 'Doctor profile retrieved successfully.', {
    _id: req.user._id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    phone: req.user.phone,
    role: req.user.role,
    profilePhoto: req.user.profilePhoto,
    gender: req.user.gender,
    dateOfBirth: req.user.dateOfBirth,
    address: req.user.address,
    isActive: req.user.isActive,
    isVerified: req.user.isVerified,
    lastLogin: req.user.lastLogin,
    createdAt: req.user.createdAt,
    updatedAt: req.user.updatedAt,
    doctorProfile,
  });
});

/**
 * @desc    Update the logged-in doctor's own editable profile fields
 * @route   PUT /api/v1/doctors/profile
 * @access  Private — doctor only
 */
const updateDoctorProfile = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    return sendError(res, 403, 'Access denied. This endpoint is for doctors only.');
  }

  // Fields the doctor is permitted to change on their User document
  const allowedUserFields = [
    'firstName',
    'lastName',
    'phone',
    'dateOfBirth',
    'gender',
    'address',
  ];

  // Fields the doctor is permitted to change on their DoctorProfile document.
  // isApproved, approvedBy, approvedAt, rating, totalReviews are intentionally
  // excluded — those are managed by admin.controller.js only.
  const allowedProfileFields = [
    'specialization',
    'qualifications',
    'experience',
    'bio',
    'consultationFee',
    'consultationDuration',
    'clinic',
    'languages',
  ];

  const userUpdates = {};
  allowedUserFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      userUpdates[field] = req.body[field];
    }
  });

  const profileUpdates = {};
  allowedProfileFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      profileUpdates[field] = req.body[field];
    }
  });

  // Handle profile photo — req.file is populated by handleProfilePhotoUpload
  if (req.file && req.file.buffer) {
    const secureUrl = await uploadBufferToCloudinary(
      req.file.buffer,
      `doctor_${req.user._id}`
    );
    userUpdates.profilePhoto = secureUrl;
  }

  if (Object.keys(userUpdates).length === 0 && Object.keys(profileUpdates).length === 0) {
    return sendError(res, 400, 'No valid fields provided to update.');
  }

  // Run both updates in parallel when both have changes
  const [updatedUser, updatedProfile] = await Promise.all([
    Object.keys(userUpdates).length > 0
      ? User.findByIdAndUpdate(
          req.user._id,
          { $set: userUpdates },
          { new: true, runValidators: true }
        ).lean()
      : Promise.resolve(req.user),

    Object.keys(profileUpdates).length > 0
      ? DoctorProfile.findOneAndUpdate(
          { userId: req.user._id },
          { $set: profileUpdates },
          { new: true, runValidators: true }
        ).lean()
      : DoctorProfile.findOne({ userId: req.user._id }).lean(),
  ]);
  if (!updatedUser) {
  return sendError(res, 404, 'Doctor not found.');
}

  if (!updatedProfile) {
    return sendError(res, 404, 'Doctor profile not found. Please contact support.');
  }

  return sendSuccess(res, 200, 'Doctor profile updated successfully.', {
    _id: updatedUser._id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    email: updatedUser.email,
    phone: updatedUser.phone,
    role: updatedUser.role,
    profilePhoto: updatedUser.profilePhoto,
    gender: updatedUser.gender,
    dateOfBirth: updatedUser.dateOfBirth,
    address: updatedUser.address,
    isActive: updatedUser.isActive,
    isVerified: updatedUser.isVerified,
    lastLogin: updatedUser.lastLogin,
    createdAt: updatedUser.createdAt,
    updatedAt: updatedUser.updatedAt,
    doctorProfile: updatedProfile,
  });
});

/**
 * @desc    Get a single doctor's public profile by their User _id
 * @route   GET /api/v1/doctors/:id
 * @access  Private — any authenticated user
 */
const getDoctorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const mongoose = require("mongoose");

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(res,400,"Invalid doctor ID.");
    }

  const [user, doctorProfile, stats] = await Promise.all([
    User.findOne({ _id: id, role: 'doctor' }).lean(),
    DoctorProfile.findOne({ userId: id }).lean(),
    Appointment.aggregate([
      { $match: { doctorId: new mongoose.Types.ObjectId(id), status: 'completed' } },
      { $group: {
          _id: null,
          completedAppointments: { $sum: 1 },
          uniquePatients: { $addToSet: "$patientId" }
        }
      }
    ])
  ]);

  if (!user || !doctorProfile) {
    return sendError(res, 404, 'Doctor not found.');
  }

  // Patients may only view profiles that have been approved
  if (req.user.role === 'patient' && !doctorProfile.isApproved) {
    return sendError(res, 404, 'Doctor not found.');
  }

  return sendSuccess(res, 200, 'Doctor profile retrieved successfully.', {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    profilePhoto: user.profilePhoto,
    gender: user.gender,
    isActive: user.isActive,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    doctorProfile,
    stats: {
      completedAppointments: stats[0]?.completedAppointments || 0,
      patientsTreated: stats[0]?.uniquePatients?.length || 0,
    }
  });
});

/**
 * @desc    Get all doctors with search, filter, sort, and pagination
 * @route   GET /api/v1/doctors
 * @access  Private — any authenticated user
 */
const getAllDoctors = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip  = (page - 1) * limit;

  // ── DoctorProfile filter ──────────────────────────────────────────────────
  const profileFilter = {};

  // Only admins can see unapproved doctors
  if (req.user.role !== 'admin') {
    profileFilter.isApproved = true;
  }

  if (req.query.specialization) {
    profileFilter.specialization = {
      $regex: new RegExp(`^${req.query.specialization.trim()}$`, 'i'),
    };
  }

  if (req.query.city) {
    profileFilter['clinic.city'] = {
      $regex: new RegExp(req.query.city.trim(), 'i'),
    };
  }

  if (req.query.minRating) {
    const min = parseFloat(req.query.minRating);
    if (!isNaN(min)) {
      profileFilter.rating = { $gte: min };
    }
  }

  if (req.query.minExperience) {
    const minExp = parseInt(req.query.minExperience, 10);
    if (!isNaN(minExp)) {
      profileFilter.experience = { $gte: minExp };
    }
  }

  if (req.query.maxFee) {
    const max = parseFloat(req.query.maxFee);
    if (!isNaN(max)) {
      profileFilter.consultationFee = { $lte: max };
    }
  }

  // ── Name search — resolve matching userIds first ──────────────────────────
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search.trim(), 'i');
    const matchedUsers = await User.find(
      {
        role: 'doctor',
        isActive: true,
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
        ],
      },
      { _id: 1 }
    ).lean();

    const matchedUserIds = matchedUsers.map((u) => u._id);

    // Search supports both user identity fields and doctor specialization.
    profileFilter.$or = [
      { specialization: searchRegex },
      ...(matchedUserIds.length > 0 ? [{ userId: { $in: matchedUserIds } }] : []),
    ];
  }

  // ── Sorting ───────────────────────────────────────────────────────────────
  const sortOptions = {
    rating:      { rating: -1 },
    fee_asc:     { consultationFee: 1 },
    fee_desc:    { consultationFee: -1 },
    experience:  { experience: -1 },
    newest:      { createdAt: -1 },
  };
  const sortBy = sortOptions[req.query.sort] || sortOptions.rating;

  // ── Query ─────────────────────────────────────────────────────────────────
  const [profiles, totalCount] = await Promise.all([
    DoctorProfile.find(profileFilter).sort(sortBy).skip(skip).limit(limit).lean(),
    DoctorProfile.countDocuments(profileFilter),
  ]);

  if (profiles.length === 0) {
    return sendSuccess(
      res,
      200,
      'Doctors retrieved successfully.',
      [],
      buildPagination(page, limit, 0)
    );
  }

  // Fetch corresponding User documents for the returned profiles
  const userIds = profiles.map((p) => p.userId);
  const users = await User.find(
    { _id: { $in: userIds }, role: 'doctor', isActive: true },
    {
      firstName: 1,
      lastName: 1,
      email: 1,
      phone: 1,
      profilePhoto: 1,
      gender: 1,
      isActive: 1,
      isVerified: 1,
      createdAt: 1,
    }
  ).lean();

  // Index by string _id for O(1) lookup
  const userMap = {};
  users.forEach((u) => {
    userMap[u._id.toString()] = u;
  });

  const doctors = profiles
    .filter((p) => userMap[p.userId.toString()])
    .map((p) => {
      const u = userMap[p.userId.toString()];
      return {
        _id: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        profilePhoto: u.profilePhoto,
        gender: u.gender,
        isActive: u.isActive,
        isVerified: u.isVerified,
        createdAt: u.createdAt,
        doctorProfile: p,
      };
    });

  return sendSuccess(
    res,
    200,
    'Doctors retrieved successfully.',
    doctors,
    buildPagination(page, limit, totalCount)
  );
});

/**
 * @desc    Get the logged-in doctor's dashboard statistics
 * @route   GET /api/v1/doctors/stats
 * @access  Private — doctor only
 */
const getDoctorStats = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    return sendError(res, 403, 'Access denied. This endpoint is for doctors only.');
  }

  const analytics = await analyticsService.getDoctorAnalytics(req.user._id);
  return sendSuccess(res, 200, 'Doctor statistics retrieved successfully.', analytics);
});

module.exports = {
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorById,
  getAllDoctors,
  getDoctorStats,
};