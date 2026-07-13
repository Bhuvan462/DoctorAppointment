// routes/availability.routes.js

const express = require("express");
const router = express.Router();
const { protect } = require("../Middleware/auth.middleware");
const {
  createAvailabilitySlot,
  createBulkAvailabilitySlots,
  getDoctorAvailability,
  getAvailableSlots,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  blockAvailabilitySlot,
  unblockAvailabilitySlot,
} = require("../controllers/availability.controller");


router.post("/bulk", protect, createBulkAvailabilitySlots);

// @route   POST /api/availability
// @desc    Create a single availability slot
// @access  Doctor
router.post("/", protect, createAvailabilitySlot);

// @route   GET /api/availability/doctor
// @desc    Get all slots for the logged-in doctor
// @access  Doctor
router.get("/doctor", protect, getDoctorAvailability);

// @route   GET /api/availability/available/:doctorId
// @desc    Get available slots for a specific doctor
// @access  Patient | Admin
router.get("/available/:doctorId", protect, getAvailableSlots);

// @route   PUT /api/availability/:id
// @desc    Update an availability slot
// @access  Doctor (own slot only)
router.put("/:id", protect, updateAvailabilitySlot);

// @route   DELETE /api/availability/:id
// @desc    Delete an availability slot
// @access  Doctor (own slot only)
router.delete("/:id", protect, deleteAvailabilitySlot);

// @route   PATCH /api/availability/:id/block
// @desc    Block an availability slot
// @access  Doctor (own slot) | Admin
router.put("/:id/block", protect, blockAvailabilitySlot);

// @route   PATCH /api/availability/:id/unblock
// @desc    Unblock an availability slot
// @access  Doctor (own slot) | Admin
router.put("/:id/unblock", protect, unblockAvailabilitySlot);

module.exports = router;