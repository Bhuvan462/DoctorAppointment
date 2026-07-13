const { body } = require('express-validator');

/**
 * Validation rules for patient registration
 */
const validatePatientRegister = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters.')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name can only contain letters, spaces, hyphens, and apostrophes.'),

  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters.')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number.'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[+]?[\d\s\-()]{7,15}$/).withMessage('Please provide a valid phone number.'),

  body('dateOfBirth')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Date of birth must be a valid date in ISO 8601 format.')
    .custom((value) => {
      const dob = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();
      if (dob >= now) {
        throw new Error('Date of birth must be in the past.');
      }
      if (age > 120) {
        throw new Error('Please provide a valid date of birth.');
      }
      return true;
    }),

  body('gender')
    .optional({ checkFalsy: true })
    .isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other.'),
];

/**
 * Validation rules for doctor registration
 */
const validateDoctorRegister = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters.')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('First name can only contain letters, spaces, hyphens, and apostrophes.'),

  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters.')
    .matches(/^[a-zA-Z\s'-]+$/).withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number.'),

  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[+]?[\d\s\-()]{7,15}$/).withMessage('Please provide a valid phone number.'),

  body('specialization')
    .trim()
    .notEmpty().withMessage('Specialization is required for doctor registration.')
    .isLength({ min: 2, max: 100 }).withMessage('Specialization must be between 2 and 100 characters.'),

  body('experience')
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 70 }).withMessage('Experience must be a number between 0 and 70 years.'),

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

  body('consultationFee')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Consultation fee must be a positive number.'),
];

/**
 * Validation rules for login
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please provide a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];

/**
 * Validation rules for changing password
 */
const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required.'),

  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number.')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from your current password.');
      }
      return true;
    }),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your new password.')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
];

module.exports = {
  validatePatientRegister,
  validateDoctorRegister,
  validateLogin,
  validateChangePassword,
};