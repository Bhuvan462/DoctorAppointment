const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const { sendSuccess, sendError, buildPagination } = require('../utils/apiResponse');

// ─── Private Helper ───────────────────────────────────────────────────────────

/**
 * Recalculate and persist the doctor's average rating and total review count.
 * Called after every create, update, or delete operation on a review.
 * Uses an aggregation pipeline so the calculation is always exact —
 * never relies on incremental counters that can drift.
 *
 * @param {mongoose.Types.ObjectId|string} doctorId
 */
const recalculateDoctorRating = async (doctorId) => {
  const result = await Review.aggregate([
    { $match: { doctorId: new mongoose.Types.ObjectId(doctorId), isVisible: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const averageRating = result.length > 0 ? parseFloat(result[0].averageRating.toFixed(2)) : 0;
  const totalReviews = result.length > 0 ? result[0].totalReviews : 0;

  await DoctorProfile.findOneAndUpdate(
    { userId: doctorId },
    { $set: { rating: averageRating, totalReviews } }
  );
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @desc    Get paginated reviews for a specific doctor
 * @route   GET /api/v1/reviews/doctor/:doctorId
 * @access  Private — any authenticated user
 */
const getDoctorReviews = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    return sendError(res, 400, 'Invalid doctor ID.');
  }

  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip  = (page - 1) * limit;

  const filter = { doctorId, isVisible: true };

  // Sorting — newest by default, highest rating optional
  const sortOptions = {
    newest:        { createdAt: -1 },
    highest_rated: { rating: -1 },
    lowest_rated:  { rating: 1 },
  };
  const sortBy = sortOptions[req.query.sort] || sortOptions.newest;

  const [reviews, totalCount] = await Promise.all([
    Review.find(filter)
      .populate('patientId', 'firstName lastName profilePhoto')
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(filter),
  ]);

  // Attach the current aggregate stats from DoctorProfile
  const doctorProfile = await DoctorProfile.findOne(
    { userId: doctorId },
    { rating: 1, totalReviews: 1 }
  ).lean();

  return sendSuccess(
    res,
    200,
    'Reviews retrieved successfully.',
    {
      reviews,
      summary: {
        averageRating: doctorProfile ? doctorProfile.rating : 0,
        totalReviews: doctorProfile ? doctorProfile.totalReviews : 0,
      },
    },
    buildPagination(page, limit, totalCount)
  );
});

/**
 * @desc    Submit a review for a completed appointment
 * @route   POST /api/v1/reviews
 * @access  Private — patient only
 */
const createReview = asyncHandler(async (req, res) => {
  const { role, _id: patientId } = req.user;

  if (role !== 'patient') {
    return sendError(res, 403, 'Only patients can submit reviews.');
  }

  const { appointmentId, rating, comment } = req.body;

  if (!appointmentId) {
    return sendError(res, 400, 'appointmentId is required.');
  }

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    return sendError(res, 400, 'Invalid appointment ID.');
  }

  if (rating === undefined || rating === null) {
    return sendError(res, 400, 'rating is required.');
  }

  const parsedRating = Number(rating);
  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return sendError(res, 400, 'Rating must be a whole number between 1 and 5.');
  }

  // Verify the appointment exists, belongs to this patient, and is completed
  const appointment = await Appointment.findById(appointmentId).lean();

  if (!appointment) {
    return sendError(res, 404, 'Appointment not found.');
  }

  if (String(appointment.patientId) !== String(patientId)) {
    return sendError(res, 403, 'You can only review your own appointments.');
  }

  if (appointment.status !== 'completed') {
    return sendError(
      res,
      400,
      'You can only review a completed appointment.'
    );
  }

  // Prevent duplicate review for the same appointment
  const existingReview = await Review.findOne({ appointmentId }).lean();
  if (existingReview) {
    return sendError(res, 409, 'You have already submitted a review for this appointment.');
  }

  const review = await Review.create({
    doctorId: appointment.doctorId,
    patientId,
    appointmentId,
    rating: parsedRating,
    comment: comment || '',
    isVisible: true,
  });

  // Recalculate doctor rating after new review
  await recalculateDoctorRating(appointment.doctorId);

  // Populate patient info for the response
  const populated = await Review.findById(review._id)
    .populate('patientId', 'firstName lastName profilePhoto')
    .lean();

  return sendSuccess(res, 201, 'Review submitted successfully.', { review: populated });
});

/**
 * @desc    Edit a patient's own review
 * @route   PUT /api/v1/reviews/:id
 * @access  Private — patient (own review only)
 */
const updateReview = asyncHandler(async (req, res) => {
  const { role, _id: patientId } = req.user;

  if (role !== 'patient') {
    return sendError(res, 403, 'Only patients can edit reviews.');
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, 'Invalid review ID.');
  }

  const review = await Review.findById(id);

  if (!review) {
    return sendError(res, 404, 'Review not found.');
  }

  if (String(review.patientId) !== String(patientId)) {
    return sendError(res, 403, 'You can only edit your own reviews.');
  }

  const { rating, comment } = req.body;

  // At least one field must be provided
  if (rating === undefined && comment === undefined) {
    return sendError(res, 400, 'Provide at least one field to update: rating or comment.');
  }

  if (rating !== undefined) {
    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return sendError(res, 400, 'Rating must be a whole number between 1 and 5.');
    }
    review.rating = parsedRating;
  }

  if (comment !== undefined) {
    review.comment = comment;
  }

  await review.save();

  // Recalculate doctor rating after edit
  await recalculateDoctorRating(review.doctorId);

  const populated = await Review.findById(review._id)
    .populate('patientId', 'firstName lastName profilePhoto')
    .lean();

  return sendSuccess(res, 200, 'Review updated successfully.', { review: populated });
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private — patient (own) or admin
 */
const deleteReview = asyncHandler(async (req, res) => {
  const { role, _id: userId } = req.user;

  if (role !== 'patient' && role !== 'admin') {
    return sendError(res, 403, 'Access denied.');
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, 'Invalid review ID.');
  }

  const review = await Review.findById(id);

  if (!review) {
    return sendError(res, 404, 'Review not found.');
  }

  // Patients can only delete their own reviews; admins can delete any
  if (role === 'patient' && String(review.patientId) !== String(userId)) {
    return sendError(res, 403, 'You can only delete your own reviews.');
  }

  const { doctorId } = review;

  await review.deleteOne();

  // Recalculate doctor rating after deletion
  await recalculateDoctorRating(doctorId);

  return sendSuccess(res, 200, 'Review deleted successfully.', null);
});

module.exports = {
  getDoctorReviews,
  createReview,
  updateReview,
  deleteReview,
};
