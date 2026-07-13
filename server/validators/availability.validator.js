const { body } = require('express-validator');

/**
 * Validation rules for creating a single availability slot
 */
const validateCreateSlot = [
  body('date')
    .notEmpty().withMessage('Date is required.')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date.')
    .custom((value) => {
      const slotDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (slotDate < today) {
        throw new Error('Slot date cannot be in the past.');
      }
      return true;
    }),

  body('startTime')
    .notEmpty().withMessage('Start time is required.')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format (e.g., 09:00).'),

  body('endTime')
    .notEmpty().withMessage('End time is required.')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format (e.g., 09:30).')
    .custom((endTime, { req }) => {
      const startTime = req.body.startTime;
      if (!startTime) return true;

      const [startHour, startMin] = startTime.split(':').map(Number);
      const [endHour, endMin] = endTime.split(':').map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (endMinutes <= startMinutes) {
        throw new Error('End time must be after start time.');
      }
      if (endMinutes - startMinutes < 10) {
        throw new Error('Slot duration must be at least 10 minutes.');
      }
      return true;
    }),
];

/**
 * Validation rules for bulk creating availability slots
 */
const validateCreateBulkSlots = [
  body('slots')
    .notEmpty().withMessage('Slots array is required.')
    .isArray({ min: 1, max: 50 }).withMessage('You must provide between 1 and 50 slots at a time.'),

  body('slots.*.date')
    .notEmpty().withMessage('Date is required for each slot.')
    .isISO8601().withMessage('Each slot date must be a valid ISO 8601 date.')
    .custom((value) => {
      const slotDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (slotDate < today) {
        throw new Error('Slot dates cannot be in the past.');
      }
      return true;
    }),

  body('slots.*.startTime')
    .notEmpty().withMessage('Start time is required for each slot.')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Each start time must be in HH:MM format.'),

  body('slots.*.endTime')
    .notEmpty().withMessage('End time is required for each slot.')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Each end time must be in HH:MM format.'),
];

/**
 * Validation rules for updating a slot (block/unblock)
 */
const validateUpdateSlot = [
  body('isBlocked')
    .optional()
    .isBoolean().withMessage('isBlocked must be a boolean value.'),
];

module.exports = {
  validateCreateSlot,
  validateCreateBulkSlots,
  validateUpdateSlot,
};