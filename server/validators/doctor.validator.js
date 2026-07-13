const { body } = require('express-validator');

/**
 * Validation rules for updating a doctor profile
 */
const validateDoctorProfileUpdate = [
  body('specialization')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Specialization must be between 2 and 100 characters.'),

  body('experience')
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 70 }).withMessage('Experience must be a number between 0 and 70.'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Bio cannot exceed 1000 characters.'),

  body('consultationFee')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Consultation fee must be a positive number.'),

  body('consultationDuration')
    .optional({ checkFalsy: true })
    .isInt({ min: 10, max: 180 }).withMessage('Consultation duration must be between 10 and 180 minutes.'),

  body('qualifications')
    .optional()
    .isArray().withMessage('Qualifications must be an array.')
    .custom((arr) => {
      if (arr.length > 10) throw new Error('Cannot have more than 10 qualifications.');
      return true;
    }),

  body('qualifications.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Each qualification must be between 1 and 100 characters.'),

  body('languages')
    .optional()
    .isArray().withMessage('Languages must be an array.')
    .custom((arr) => {
      if (arr.length > 10) throw new Error('Cannot list more than 10 languages.');
      return true;
    }),

  body('languages.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 }).withMessage('Each language must be between 1 and 50 characters.'),

  body('clinic.name')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Clinic name cannot exceed 200 characters.'),

  body('clinic.address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Clinic address cannot exceed 500 characters.'),

  body('clinic.city')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Clinic city cannot exceed 100 characters.'),
];

module.exports = { validateDoctorProfileUpdate };