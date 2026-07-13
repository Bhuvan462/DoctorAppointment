const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const { generateToken } = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { sendEmail } = require('../services/email/email.service');
const crypto = require('crypto');

/**
 * @desc    Register a new patient
 * @route   POST /api/v1/auth/register/patient
 * @access  Public
 */
const registerPatient = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, phone, dateOfBirth, gender } = req.body;

  // Check if a user with this email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 409, 'An account with this email address already exists.');
  }

  // Create the patient user record
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone: phone || '',
    dateOfBirth: dateOfBirth || null,
    gender: gender || '',
    role: 'patient',
    isActive: true,
    isVerified: false,
  });

  // Generate authentication token
  const token = generateToken(user._id, user.role);

  // Send welcome email (non-blocking)
  sendEmail(user.email, 'welcome', { name: user.firstName }).catch(err => {
    console.error('Welcome email failed:', err.message);
  });

  return sendSuccess(res, 201, 'Patient account created successfully.', {
    token,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profilePhoto: user.profilePhoto,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
  });
});

/**
 * @desc    Register a new doctor
 * @route   POST /api/v1/auth/register/doctor
 * @access  Public
 */
const registerDoctor = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    specialization,
    experience,
    qualifications,
    consultationFee,
    bio,
  } = req.body;

  // Check if a user with this email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 409, 'An account with this email address already exists.');
  }

  // Create the doctor user record
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone: phone || '',
    role: 'doctor',
    isActive: true,
    isVerified: false,
  });

  // Create the associated doctor profile
  await DoctorProfile.create({
    userId: user._id,
    specialization,
    experience: experience || 0,
    qualifications: qualifications || [],
    consultationFee: consultationFee || 0,
    bio: bio || '',
    isApproved: false,
  });

  // Generate authentication token
  const token = generateToken(user._id, user.role);

  // Send welcome email (non-blocking)
  sendEmail(user.email, 'welcome', { name: user.firstName }).catch(err => {
    console.error('Welcome email failed:', err.message);
  });

  return sendSuccess(res, 201, 'Doctor account created successfully. Your profile is pending administrator approval.', {
    token,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profilePhoto: user.profilePhoto,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
  });
});

/**
 * @desc    Login any user (patient, doctor, admin)
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and explicitly select the password field (normally excluded)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return sendError(res, 401, 'Invalid email or password.');
  }

  // Check if account is active
  if (!user.isActive) {
    return sendError(res, 403, 'Your account has been deactivated. Please contact support.');
  }

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return sendError(res, 401, 'Invalid email or password.');
  }

  // Update last login timestamp
  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

  // Generate authentication token
  const token = generateToken(user._id, user.role);

  // Build response data — include doctor profile info if doctor
  let additionalData = {};
  if (user.role === 'doctor') {
    const doctorProfile = await DoctorProfile.findOne({ userId: user._id }).select(
      'specialization isApproved rating totalReviews consultationFee'
    );
    if (doctorProfile) {
      additionalData.doctorProfile = doctorProfile;
    }
  }

  return sendSuccess(res, 200, 'Login successful.', {
    token,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profilePhoto: user.profilePhoto,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
      isActive: user.isActive,
      isVerified: user.isVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      ...additionalData,
    },
  });
});

/**
 * @desc    Get currently authenticated user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  // req.user is populated by the protect middleware
  const user = await User.findById(req.user._id);

  if (!user) {
    return sendError(res, 404, 'User not found.');
  }

  let additionalData = {};

  // Include doctor profile if the user is a doctor
  if (user.role === 'doctor') {
    const doctorProfile = await DoctorProfile.findOne({ userId: user._id });
    if (doctorProfile) {
      additionalData.doctorProfile = doctorProfile;
    }
  }

  return sendSuccess(res, 200, 'User profile retrieved successfully.', {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profilePhoto: user.profilePhoto,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth,
    address: user.address,
    isActive: user.isActive,
    isVerified: user.isVerified,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    ...additionalData,
  });
});

/**
 * @desc    Change the authenticated user's password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Fetch user with password selected (normally excluded)
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return sendError(res, 404, 'User not found.');
  }

  // Verify current password
  const isCurrentPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordCorrect) {
    return sendError(res, 401, 'Current password is incorrect.');
  }

  // Set new password (the pre-save hook will hash it)
  user.password = newPassword;
  await user.save();

  // Send password changed notification email (non-blocking)
  sendEmail(user.email, 'passwordChanged', { name: user.firstName }).catch(err => {
    console.error('Password change email failed:', err.message);
  });

  return sendSuccess(res, 200, 'Password changed successfully.');
});

/**
 * @desc    Logout user (client-side token removal; server-side acknowledgment)
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // With stateless JWT, logout is handled client-side by removing the token.
  // This endpoint serves as a server-side acknowledgment and can be used
  // to implement a token blacklist in the future.
  return sendSuccess(res, 200, 'Logged out successfully. Please remove your token on the client side.');
});

/**
 * @desc    Forgot Password
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return sendError(res, 400, 'Please provide an email.');
  }

  const user = await User.findOne({ email });
  if (!user) {
    return sendSuccess(res, 200, 'If an account with that email exists, we sent a password reset link.');
  }

  // Generate token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  // Send email
  sendEmail(user.email, 'forgotPassword', {
    name: user.firstName,
    link: resetUrl,
    linkText: 'Reset Password',
    body: 'You requested a password reset. Please click the button below to reset your password. This link will expire in 15 minutes.'
  }).catch(err => console.error(err));

  return sendSuccess(res, 200, 'If an account with that email exists, we sent a password reset link.');
});

/**
 * @desc    Reset Password
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  
  if (!token || !newPassword) {
    return sendError(res, 400, 'Token and new password are required.');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return sendError(res, 400, 'Invalid or expired password reset token.');
  }

  user.password = newPassword; // Hashed in pre-save hook
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return sendSuccess(res, 200, 'Password has been reset successfully. You can now log in.');
});

module.exports = {
  registerPatient,
  registerDoctor,
  login,
  getMe,
  changePassword,
  logout,
  forgotPassword,
  resetPassword
};