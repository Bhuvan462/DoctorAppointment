const express = require('express');
const router = express.Router();

const {
  getDoctorReviews,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/review.controller');

const { protect } = require('../Middleware/auth.middleware');

// All review routes require authentication
router.use(protect);

/**
 * @route   GET /api/v1/reviews/doctor/:doctorId
 * @desc    Get paginated reviews for a specific doctor
 * @access  Private — any authenticated user
 */
router.get('/doctor/:doctorId', getDoctorReviews);

/**
 * @route   POST /api/v1/reviews
 * @desc    Submit a review for a completed appointment
 * @access  Private — patient only
 */
router.post('/', createReview);

/**
 * @route   PUT /api/v1/reviews/:id
 * @desc    Edit own review
 * @access  Private — patient only
 */
router.put('/:id', updateReview);

/**
 * @route   DELETE /api/v1/reviews/:id
 * @desc    Delete a review
 * @access  Private — patient or admin
 */
router.delete('/:id', deleteReview);

module.exports = router;