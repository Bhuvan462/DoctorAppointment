const express = require('express');
const router = express.Router();
const { protect } = require('../Middleware/auth.middleware');
const {
  getPatientConsultationHistory,
  getDoctorConsultationRecords,
  getConsultationByAppointment,
  createConsultationRecord,
  updateConsultationRecord,
} = require('../controllers/consultation.controller');

// All consultation routes require authentication
router.use(protect);

/**
 * @route   GET /api/v1/consultations/patient/history
 * @desc    Get consultation history for the authenticated patient
 * @access  Private — patient only
 */
router.get('/patient/history', getPatientConsultationHistory);

/**
 * @route   GET /api/v1/consultations/doctor/records
 * @desc    Get consultation records for the authenticated doctor
 * @access  Private — doctor only
 */
router.get('/doctor/records', getDoctorConsultationRecords);

/**
 * @route   POST /api/v1/consultations
 * @desc    Create a consultation record
 * @access  Private — doctor only
 */
router.post('/', createConsultationRecord);

/**
 * @route   GET /api/v1/consultations/:appointmentId
 * @desc    Get a single consultation record by appointment ID
 * @access  Private — patient (own) | doctor (own) | admin
 */
router.get('/:appointmentId', getConsultationByAppointment);

/**
 * @route   PUT /api/v1/consultations/:id
 * @desc    Update an existing consultation record
 * @access  Private — doctor (own record only)
 */
router.put('/:id', updateConsultationRecord);

module.exports = router;
