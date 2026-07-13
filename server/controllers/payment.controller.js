const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const paymentService = require('../services/payment.service');
const { sendSuccess, sendError, buildPagination } = require('../utils/apiResponse');

/**
 * @desc    Process a payment for an appointment
 * @route   POST /api/v1/payments/process
 * @access  Private — patient only
 */
const processPayment = asyncHandler(async (req, res) => {
  if (req.user.role !== 'patient') {
    return sendError(res, 403, 'Only patients can process payments.');
  }

  const { appointmentId, amount, tax, total, method } = req.body;

  if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
    return sendError(res, 400, 'A valid appointmentId is required.');
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return sendError(res, 404, 'Appointment not found.');
  }

  if (String(appointment.patientId) !== String(req.user._id)) {
    return sendError(res, 403, 'Access denied.');
  }

  // Check if a successful payment already exists for this appointment
  const existingPayment = await Payment.findOne({ appointmentId, status: 'successful' });
  if (existingPayment) {
    return sendError(res, 400, 'This appointment has already been paid for.');
  }

  // Create initial pending payment
  const payment = await Payment.create({
    appointmentId,
    patientId: req.user._id,
    doctorId: appointment.doctorId,
    amount,
    tax: tax || 0,
    total,
    method,
    status: 'processing',
    referenceNumber: paymentService.generateReferenceNumber(),
    statusHistory: [{ status: 'processing', notes: 'Payment processing started' }]
  });

  try {
    // Process payment via service
    const result = await paymentService.processPayment({ amount: total, method });

    payment.status = result.status;
    payment.referenceNumber = result.referenceId;
    payment.providerDetails = result.providerDetails;
    payment.statusHistory.push({ status: result.status, notes: result.success ? 'Payment successful' : 'Payment failed' });
    
    await payment.save();

    // Update appointment payment status
    appointment.paymentStatus = result.status;
    appointment.paymentId = payment._id;
    await appointment.save();

    if (result.success) {
      // Notify doctor of payment received
      await Notification.create({
        userId: appointment.doctorId,
        title: 'Payment Received',
        message: `Payment of ₹${total} received for appointment with ${req.user.firstName} ${req.user.lastName}.`,
        type: 'payment_received',
        relatedId: payment._id,
        relatedModel: 'Payment',
      });
      return sendSuccess(res, 200, 'Payment processed successfully.', payment);
    } else {
      return sendError(res, 400, 'Payment failed.', payment);
    }
  } catch (error) {
    payment.status = 'failed';
    payment.statusHistory.push({ status: 'failed', notes: error.message });
    await payment.save();
    
    appointment.paymentStatus = 'failed';
    appointment.paymentId = payment._id;
    await appointment.save();

    return sendError(res, 500, 'Payment processing error.', payment);
  }
});

/**
 * @desc    Get payment history for user
 * @route   GET /api/v1/payments/history
 * @access  Private
 */
const getPaymentHistory = asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip  = (page - 1) * limit;

  const filter = {};
  if (req.user.role === 'patient') {
    filter.patientId = req.user._id;
  } else if (req.user.role === 'doctor') {
    filter.doctorId = req.user._id;
  } else if (req.user.role !== 'admin') {
    return sendError(res, 403, 'Access denied.');
  }

  if (req.query.status) {
    filter.status = req.query.status;
  }

  const [payments, totalCount] = await Promise.all([
    Payment.find(filter)
      .populate('patientId', 'firstName lastName email profilePhoto')
      .populate('doctorId', 'firstName lastName email profilePhoto')
      .populate({
        path: 'appointmentId',
        select: 'appointmentDate startTime type status',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(filter),
  ]);

  return sendSuccess(
    res,
    200,
    'Payments retrieved successfully.',
    payments,
    buildPagination(page, limit, totalCount)
  );
});

/**
 * @desc    Get all payments (Admin)
 * @route   GET /api/v1/payments/admin/all
 * @access  Private — admin only
 */
const getAdminPayments = asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return sendError(res, 403, 'Access denied.');
  }

  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip  = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.method) filter.method = req.query.method;
  if (req.query.patientId) filter.patientId = req.query.patientId;
  if (req.query.doctorId) filter.doctorId = req.query.doctorId;

  const [payments, totalCount] = await Promise.all([
    Payment.find(filter)
      .populate('patientId', 'firstName lastName email profilePhoto')
      .populate('doctorId', 'firstName lastName email profilePhoto')
      .populate({
        path: 'appointmentId',
        select: 'appointmentDate startTime type status',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Payment.countDocuments(filter),
  ]);

  // Optionally calculate aggregates here
  const aggregates = await Payment.aggregate([
    { $match: filter },
    { $group: { _id: "$status", totalAmount: { $sum: "$total" }, count: { $sum: 1 } } }
  ]);

  return sendSuccess(
    res,
    200,
    'All payments retrieved successfully.',
    { payments, aggregates },
    buildPagination(page, limit, totalCount)
  );
});

/**
 * @desc    Get payment by ID
 * @route   GET /api/v1/payments/:id
 * @access  Private
 */
const getPaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, 'Invalid payment ID.');
  }

  const payment = await Payment.findById(id)
    .populate('patientId', 'firstName lastName email phone')
    .populate({
      path: 'doctorId',
      select: 'firstName lastName email phone',
      populate: { path: 'doctorProfile' }
    })
    .populate({
      path: 'appointmentId',
      select: 'appointmentDate startTime type status',
    })
    .lean();

  if (!payment) {
    return sendError(res, 404, 'Payment not found.');
  }

  const userId = String(req.user._id);
  if (req.user.role !== 'admin' && String(payment.patientId._id) !== userId && String(payment.doctorId._id) !== userId) {
    return sendError(res, 403, 'Access denied.');
  }

  return sendSuccess(res, 200, 'Payment retrieved successfully.', payment);
});

module.exports = {
  processPayment,
  getPaymentHistory,
  getAdminPayments,
  getPaymentById,
};
