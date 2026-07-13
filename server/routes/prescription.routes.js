const express = require('express');
const router = express.Router();
const { protect } = require('../Middleware/auth.middleware');
const {
  getPatientPrescriptions,
  getDoctorPrescriptions,
  getPrescriptionById,
  getPrescriptionByAppointmentId,
  issuePrescription,
  uploadPrescription,
} = require('../controllers/prescription.controller');

// All prescription routes require authentication
router.use(protect);

/**
 * @route   GET /api/v1/prescriptions/patient
 * @desc    Get all prescriptions for the authenticated patient
 * @access  Private — patient only
 */
router.get('/patient', getPatientPrescriptions);

/**
 * @route   GET /api/v1/prescriptions/doctor
 * @desc    Get all prescriptions issued by the authenticated doctor
 * @access  Private — doctor only
 */
router.get('/doctor', getDoctorPrescriptions);

/**
 * @route   POST /api/v1/prescriptions
 * @desc    Issue a new prescription
 * @access  Private — doctor only
 */
router.post('/', issuePrescription);

const { handlePrescriptionUpload } = require('../Middleware/upload.middleware');

/**
 * @route   POST /api/v1/prescriptions/upload/:appointmentId
 * @desc    Upload a prescription file
 * @access  Private — doctor only
 */
router.post('/upload/:appointmentId', handlePrescriptionUpload, uploadPrescription);

/**
 * @route   GET /api/v1/prescriptions/appointment/:appointmentId
 * @desc    Get prescription by appointment ID
 * @access  Private — patient (own) | doctor (own) | admin
 */
router.get('/appointment/:appointmentId', getPrescriptionByAppointmentId);

/**
 * @route   GET /api/v1/prescriptions/:id
 * @desc    Get a single prescription by ID
 * @access  Private — patient (own) | doctor (own) | admin
 */
router.get('/:id', getPrescriptionById);

module.exports = router;
