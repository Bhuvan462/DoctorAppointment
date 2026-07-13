const express = require('express');
const router = express.Router();

const {
  registerPatient,
  registerDoctor,
  login,
  getMe,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth.controller');

const { protect } = require('../Middleware/auth.middleware');
const { validate } = require('../Middleware/validate.middleware');

const {
  validatePatientRegister,
  validateDoctorRegister,
  validateLogin,
  validateChangePassword,
} = require('../validators/auth.validator');

// ─── Public Routes ───────────────────────────────────────────────────────────

/**
 * @route   POST /api/v1/auth/register/patient
 * @desc    Register a new patient account
 * @access  Public
 */
router.post('/register/patient', validatePatientRegister, validate, registerPatient);

/**
 * @route   POST /api/v1/auth/register/doctor
 * @desc    Register a new doctor account (pending admin approval)
 * @access  Public
 */
router.post('/register/doctor', validateDoctorRegister, validate, registerDoctor);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate any user and receive JWT token
 * @access  Public
 */
router.post('/login', validateLogin, validate, login);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ─── Private Routes (Require Authentication) ────────────────────────────────

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get the currently authenticated user's profile
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   PUT /api/v1/auth/change-password
 * @desc    Change the authenticated user's password
 * @access  Private
 */
router.put('/change-password', protect, validateChangePassword, validate, changePassword);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout the authenticated user
 * @access  Private
 */
router.post('/logout', protect, logout);

module.exports = router;