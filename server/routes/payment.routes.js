const express = require('express');
const router = express.Router();
const { protect } = require('../Middleware/auth.middleware');
const { authorize } = require('../Middleware/role.middleware');
const {
  processPayment,
  getPaymentHistory,
  getAdminPayments,
  getPaymentById,
} = require('../controllers/payment.controller');

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/v1/payments/process
 * @desc    Process a new payment for an appointment
 * @access  Private — patient only
 */
router.post('/process', authorize('patient'), processPayment);

/**
 * @route   GET /api/v1/payments/history
 * @desc    Get payment history for user (Patient or Doctor)
 * @access  Private
 */
router.get('/history', getPaymentHistory);

/**
 * @route   GET /api/v1/payments/admin/all
 * @desc    Get all payments
 * @access  Private — admin only
 */
router.get('/admin/all', authorize('admin'), getAdminPayments);

/**
 * @route   GET /api/v1/payments/:id
 * @desc    Get a single payment by ID
 * @access  Private
 */
router.get('/:id', getPaymentById);

module.exports = router;
