const { body, param } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Reusable ObjectId validator
 */
const isValidObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid ID format.');
  }
  return true;
};

/**
 * Validation rules for booking a new appointment
 */
const validateBookAppointment = [
  body('doctorId')
    .notEmpty().withMessage('Doctor ID is required.')
    .custom(isValidObjectId),

  body('slotId')
    .notEmpty().withMessage('Slot ID is required.')
    .custom(isValidObjectId),

  body('reasonForVisit')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Reason for visit cannot exceed 500 characters.'),

  body('type')
    .optional()
    .isIn(['in-person', 'online']).withMessage('Appointment type must be in-person or online.'),
];

/**
 * Validation rules for cancelling an appointment
 */
const validateCancelAppointment = [
  body('cancellationReason')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Cancellation reason cannot exceed 500 characters.'),
];

/**
 * Validation rules for rescheduling an appointment
 */
const validateRescheduleAppointment = [
  body('newSlotId')
    .notEmpty().withMessage('New slot ID is required for rescheduling.')
    .custom(isValidObjectId),
];

module.exports = {
  validateBookAppointment,
  validateCancelAppointment,
  validateRescheduleAppointment,
};