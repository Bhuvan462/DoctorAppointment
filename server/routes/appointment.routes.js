// routes/appointment.routes.js

const express = require("express");
const router = express.Router();
const { protect } = require("../Middleware/auth.middleware");
const {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAllAppointments,
  getAppointmentById,
  confirmAppointment,
  rejectAppointment,
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
} = require("../controllers/appointment.controller");

// @route   POST /api/appointments
// @desc    Book a new appointment
// @access  Patient
router.post("/", protect, bookAppointment);

// @route   GET /api/appointments/patient
// @desc    Get patient's own appointments
// @access  Patient
router.get("/patient", protect, getPatientAppointments);

// @route   GET /api/appointments/doctor
// @desc    Get doctor's own appointments
// @access  Doctor
router.get("/doctor", protect, getDoctorAppointments);

// @route   GET /api/appointments
// @desc    Get all appointments
// @access  Admin
router.get("/", protect, getAllAppointments);

// @route   GET /api/appointments/:id
// @desc    Get appointment by ID
// @access  Patient (own) | Doctor (own) | Admin
router.get("/:id", protect, getAppointmentById);

// @route   PUT /api/appointments/:id/confirm
// @desc    Confirm an appointment
// @access  Doctor
router.put("/:id/confirm", protect, confirmAppointment);

// @route   PUT /api/appointments/:id/reject
// @desc    Reject an appointment
// @access  Doctor
router.put("/:id/reject", protect, rejectAppointment);

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel an appointment
// @access  Patient | Doctor | Admin
router.put("/:id/cancel", protect, cancelAppointment);

// @route   PUT /api/appointments/:id/reschedule
// @desc    Reschedule an appointment
// @access  Patient
router.put("/:id/reschedule", protect, rescheduleAppointment);

// @route   PUT /api/appointments/:id/complete
// @desc    Mark an appointment as completed
// @access  Doctor
router.put("/:id/complete", protect, completeAppointment);

module.exports = router;