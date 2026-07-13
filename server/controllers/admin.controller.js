const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const AvailabilitySlot = require('../models/AvailabilitySlot');
const ConsultationRecord = require('../models/ConsultationRecord');
const Prescription = require('../models/Prescription');
const Notification = require('../models/Notification');
const analyticsService = require('../services/analytics.service');
const { sendSuccess, sendError, buildPagination } = require('../utils/apiResponse');

// ─── Doctor Approval ──────────────────────────────────────────────────────────

/**
 * @desc    Approve a doctor's profile
 * @route   PATCH /api/v1/admin/doctors/:id/approve
 * @access  Private — admin only
 */
const approveDoctor = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return sendError(res, 403, 'Access denied. Admins only.');
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, 'Invalid doctor ID.');
  }

  // id is the DoctorProfile _id (sent by the frontend)
  const doctorProfile = await DoctorProfile.findById(id);

  if (!doctorProfile) {
    return sendError(res, 404, 'Doctor profile not found.');
  }

  const doctor = await User.findOne({
    _id: doctorProfile.userId,
    role: 'doctor',
  }).lean();

  if (!doctor) {
    return sendError(res, 404, 'Doctor not found.');
  }

  if (doctorProfile.isApproved) {
    return sendError(res, 400, 'This doctor is already approved.');
  }

  doctorProfile.isApproved = true;
  doctorProfile.approvedBy = req.user._id;
  doctorProfile.approvedAt = new Date();
  await doctorProfile.save();

  await Notification.create({
    userId: doctorProfile.userId,
    title: 'Account Approved',
    message:
      'Congratulations! Your doctor account has been approved. You can now receive appointments.',
    type: 'doctor_approved',
    relatedId: doctorProfile._id,
    relatedModel: 'User',
  });

  return sendSuccess(res, 200, 'Doctor approved successfully.', {
    doctorId: doctor._id,
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    email: doctor.email,
    isApproved: doctorProfile.isApproved,
    approvedBy: doctorProfile.approvedBy,
    approvedAt: doctorProfile.approvedAt,
  });
});

/**
 * @desc    Reject a doctor's profile
 * @route   PATCH /api/v1/admin/doctors/:id/reject
 * @access  Private — admin only
 */
const rejectDoctor = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return sendError(res, 403, 'Access denied. Admins only.');
  }

  const { id } = req.params;
  const { reason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, 'Invalid doctor ID.');
  }

  // id is the DoctorProfile _id (same as approve)
  const doctorProfile = await DoctorProfile.findById(id);
  if (!doctorProfile) {
    return sendError(res, 404, 'Doctor profile not found.');
  }

  const doctor = await User.findOne({ _id: doctorProfile.userId, role: 'doctor' }).lean();
  if (!doctor) {
    return sendError(res, 404, 'Doctor not found.');
  }

  doctorProfile.isApproved = false;
  doctorProfile.approvedBy = null;
  doctorProfile.approvedAt = null;
  await doctorProfile.save();

  await Notification.create({
    userId: doctorProfile.userId,
    title: 'Account Rejected',
    message: reason
      ? `Your doctor account has been rejected. Reason: ${reason}`
      : 'Your doctor account has been rejected. Please contact support for more information.',
    type: 'doctor_rejected',
    relatedId: doctorProfile._id,
    relatedModel: 'User',
  });

  return sendSuccess(res, 200, 'Doctor rejected successfully.', {
    doctorId: doctor._id,
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    email: doctor.email,
    isApproved: doctorProfile.isApproved,
  });
});

/**
 * @desc    Get all doctors (approved and pending) with filtering and pagination
 * @route   GET /api/v1/admin/doctors
 * @access  Private — admin only
 */
const getAllDoctorsAdmin = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return sendError(res, 403, 'Access denied. Admins only.');
  }

  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip  = (page - 1) * limit;

  // DoctorProfile filter
  const profileFilter = {};

  if (req.query.isApproved !== undefined) {
    profileFilter.isApproved = req.query.isApproved === 'true';
  }

  if (req.query.specialization) {
    profileFilter.specialization = {
      $regex: new RegExp(`^${req.query.specialization.trim()}$`, 'i'),
    };
  }

  // Name / email search — resolve matching userIds first
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search.trim(), 'i');
    const matchedUsers = await User.find(
      {
        role: 'doctor',
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
        ],
      },
      { _id: 1 }
    ).lean();

    if (matchedUsers.length === 0) {
      return sendSuccess(
        res,
        200,
        'Doctors retrieved successfully.',
        [],
        buildPagination(page, limit, 0)
      );
    }

    profileFilter.userId = { $in: matchedUsers.map((u) => u._id) };
  }

  const [profiles, totalCount] = await Promise.all([
    DoctorProfile.find(profileFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
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

  const userIds = profiles.map((p) => p.userId);
  const users = await User.find(
    { _id: { $in: userIds }, role: 'doctor' },
    {
      firstName: 1,
      lastName: 1,
      email: 1,
      phone: 1,
      profilePhoto: 1,
      isActive: 1,
      isVerified: 1,
      createdAt: 1,
    }
  ).lean();

  const userMap = {};
  users.forEach((u) => {
    userMap[u._id.toString()] = u;
  });

  const doctors = profiles
    .filter((p) => userMap[p.userId.toString()])
    .map((p) => ({
      _id: userMap[p.userId.toString()]._id,
      ...userMap[p.userId.toString()],
      doctorProfile: p,
    }));

  return sendSuccess(
    res,
    200,
    'Doctors retrieved successfully.',
    doctors,
    buildPagination(page, limit, totalCount)
  );
});

// ─── User Management ──────────────────────────────────────────────────────────

/**
 * @desc    Get all users with search, role filter, and pagination
 * @route   GET /api/v1/admin/users
 * @access  Private — admin only
 */
const getAllUsers = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return sendError(res, 403, 'Access denied. Admins only.');
  }

  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip  = (page - 1) * limit;

  const filter = {};

  // Filter by role
  if (req.query.role) {
    if (!['patient', 'doctor', 'admin'].includes(req.query.role)) {
      return sendError(res, 400, 'Invalid role filter. Must be patient, doctor, or admin.');
    }
    filter.role = req.query.role;
  }

  // Filter by active status
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  // Name / email search
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search.trim(), 'i');
    filter.$or = [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
    ];
  }

  const [users, totalCount] = await Promise.all([
    User.find(filter)
      .select('-password -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return sendSuccess(
    res,
    200,
    'Users retrieved successfully.',
    users,
    buildPagination(page, limit, totalCount)
  );
});

/**
 * @desc    Get a single user by ID
 * @route   GET /api/v1/admin/users/:id
 * @access  Private — admin only
 */
const getUserById = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return sendError(res, 403, 'Access denied. Admins only.');
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, 'Invalid user ID.');
  }

  const user = await User.findById(id).select('-password -__v').lean();
  if (!user) {
    return sendError(res, 404, 'User not found.');
  }

  // If the user is a doctor, attach their profile
  let doctorProfile = null;
  if (user.role === 'doctor') {
    doctorProfile = await DoctorProfile.findOne({ userId: id }).lean();
  }

  return sendSuccess(res, 200, 'User retrieved successfully.', {
    ...user,
    ...(doctorProfile && { doctorProfile }),
  });
});

/**
 * @desc    Deactivate a user account
 * @route   PATCH /api/v1/admin/users/:id/deactivate
 * @access  Private — admin only
 */
const deactivateUser = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return sendError(res, 403, 'Access denied. Admins only.');
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, 'Invalid user ID.');
  }

  // Prevent admin from deactivating their own account
  if (String(id) === String(req.user._id)) {
    return sendError(res, 400, 'You cannot deactivate your own account.');
  }

  const user = await User.findById(id);
  if (!user) {
    return sendError(res, 404, 'User not found.');
  }

  if (!user.isActive) {
    return sendError(res, 400, 'This account is already deactivated.');
  }

  user.isActive = false;
  await user.save();

  await Notification.create({
    userId: id,
    title: 'Account Deactivated',
    message:
      'Your account has been deactivated by an administrator. Please contact support if you believe this is an error.',
    type: 'general',
    relatedId: user._id,
    relatedModel: 'User',
  });

  return sendSuccess(res, 200, 'User account deactivated successfully.', {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    isActive: user.isActive,
  });
});

/**
 * @desc    Activate a user account
 * @route   PATCH /api/v1/admin/users/:id/activate
 * @access  Private — admin only
 */
const activateUser = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return sendError(res, 403, 'Access denied. Admins only.');
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, 'Invalid user ID.');
  }

  const user = await User.findById(id);
  if (!user) {
    return sendError(res, 404, 'User not found.');
  }

  if (user.isActive) {
    return sendError(res, 400, 'This account is already active.');
  }

  user.isActive = true;
  await user.save();

  await Notification.create({
    userId: id,
    title: 'Account Activated',
    message: 'Your account has been reactivated by an administrator. Welcome back!',
    type: 'general',
    relatedId: user._id,
    relatedModel: 'User',
  });

  return sendSuccess(res, 200, 'User account activated successfully.', {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    isActive: user.isActive,
  });
});

// ─── Platform Statistics ──────────────────────────────────────────────────────

/**
 * @desc    Get platform-wide statistics for the admin dashboard
 * @route   GET /api/v1/admin/stats
 * @access  Private — admin only
 */
const getAdminStats = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return sendError(res, 403, 'Access denied. Admins only.');
  }

  const analytics = await analyticsService.getAdminAnalytics();
  return sendSuccess(res, 200, 'Admin analytics retrieved successfully.', analytics);
});

// ─── Operational Reports ──────────────────────────────────────────────────────

/**
 * @desc    Get operational reports (appointments by month, revenue, top doctors)
 * @route   GET /api/v1/admin/reports
 * @access  Private — admin only
 */
const getAdminReports = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return sendError(res, 403, 'Access denied. Admins only.');
  }

  const now = new Date();

  // Build last 6 months array
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end   = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    months.push({ start, end, label: start.toLocaleString('default', { month: 'short', year: 'numeric' }) });
  }

  // Appointments per month for the last 6 months
  const appointmentsByMonth = await Promise.all(
    months.map(async ({ start, end, label }) => {
      const [total, completed, cancelled] = await Promise.all([
        Appointment.countDocuments({ appointmentDate: { $gte: start, $lte: end } }),
        Appointment.countDocuments({ appointmentDate: { $gte: start, $lte: end }, status: 'completed' }),
        Appointment.countDocuments({ appointmentDate: { $gte: start, $lte: end }, status: 'cancelled' }),
      ]);
      return { month: label, total, completed, cancelled };
    })
  );

  // New user registrations per month for the last 6 months
  const registrationsByMonth = await Promise.all(
    months.map(async ({ start, end, label }) => {
      const [patients, doctors] = await Promise.all([
        User.countDocuments({ role: 'patient', createdAt: { $gte: start, $lte: end } }),
        User.countDocuments({ role: 'doctor', createdAt: { $gte: start, $lte: end } }),
      ]);
      return { month: label, patients, doctors };
    })
  );

  // Top 5 doctors by completed appointments
  const topDoctorsAgg = await Appointment.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$doctorId', completedAppointments: { $sum: 1 } } },
    { $sort: { completedAppointments: -1 } },
    { $limit: 5 },
  ]);

  const topDoctorIds = topDoctorsAgg.map((d) => d._id);
  const topDoctorUsers = await User.find(
    { _id: { $in: topDoctorIds } },
    { firstName: 1, lastName: 1, profilePhoto: 1 }
  ).lean();

  const topDoctorProfiles = await DoctorProfile.find(
    { userId: { $in: topDoctorIds } },
    { userId: 1, specialization: 1, rating: 1 }
  ).lean();

  const profileMap = {};
  topDoctorProfiles.forEach((p) => { profileMap[p.userId.toString()] = p; });

  const topDoctors = topDoctorsAgg.map((agg) => {
    const user = topDoctorUsers.find((u) => u._id.toString() === agg._id.toString());
    const profile = profileMap[agg._id.toString()];
    return {
      doctorId: agg._id,
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      profilePhoto: user?.profilePhoto || '',
      specialization: profile?.specialization || '',
      rating: profile?.rating || 0,
      completedAppointments: agg.completedAppointments,
    };
  });

  // Appointment type breakdown (in-person vs online)
  const typeBreakdown = await Appointment.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ]);

  const appointmentTypes = { 'in-person': 0, online: 0 };
  typeBreakdown.forEach(({ _id, count }) => {
    if (_id in appointmentTypes) appointmentTypes[_id] = count;
  });

  return sendSuccess(res, 200, 'Reports retrieved successfully.', {
    appointmentsByMonth,
    registrationsByMonth,
    topDoctors,
    appointmentTypes,
  });
});

module.exports = {
  approveDoctor,
  rejectDoctor,
  getAllDoctorsAdmin,
  getAllUsers,
  getUserById,
  deactivateUser,
  activateUser,
  getAdminStats,
  getAdminReports,
};