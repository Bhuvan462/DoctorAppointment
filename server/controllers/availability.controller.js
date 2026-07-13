// controllers/availability.controller.js

const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const AvailabilitySlot = require("../models/AvailabilitySlot");
const User = require("../models/User");
const { sendSuccess, sendError, buildPagination } = require("../utils/apiResponse");

// @desc    Create a single availability slot
// @route   POST /api/availability
// @access  Doctor
const createAvailabilitySlot = asyncHandler(async (req, res) => {
  const { role, _id: doctorId } = req.user;

  if (role !== "doctor") {
    return sendError(res, 403, "Only doctors can create availability slots.");
  }

  const { date, startTime, endTime } = req.body;

  if (!date || !startTime || !endTime) {
    return sendError(res, 400, "date, startTime, and endTime are required.");
  }

  const slotDate = new Date(date);

    if (isNaN(slotDate.getTime())) {
    return sendError(res, 400, "Invalid date format.");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    slotDate.setHours(0, 0, 0, 0);

    if (slotDate < today) {
        return sendError(res, 400, "Cannot create availability slots in the past.");
    }
  if (isNaN(slotDate.getTime())) {
    return sendError(res, 400, "Invalid date format.");
  }

  if (endTime <= startTime) {
    return sendError(res, 400, "endTime must be after startTime.");
  }

  const duplicate = await AvailabilitySlot.findOne({
    doctorId,
    date: slotDate,
    startTime,
    endTime,
  });

  if (duplicate) {
    return sendError(res, 409, "An availability slot already exists for this date and time.");
  }

  const slot = await AvailabilitySlot.create({
    doctorId,
    date: slotDate,
    startTime,
    endTime,
    isBooked: false,
    isBlocked: false,
  });

  return sendSuccess(res, 201, "Availability slot created successfully.", { slot });
});

// @desc    Get all slots for the logged-in doctor (own slots)
// @route   GET /api/availability/doctor
// @access  Doctor
const getDoctorAvailability = asyncHandler(async (req, res) => {
  const { role, _id: doctorId } = req.user;

  if (role !== "doctor") {
    return sendError(res, 403, "Access denied.");
  }

  const { date, isBooked, isBlocked, page = 1, limit = 10 } = req.query;

  const filter = { doctorId };

  if (date) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return sendError(res, 400, "Invalid date format.");
    }
    const start = new Date(parsedDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(parsedDate);
    end.setHours(23, 59, 59, 999);

    filter.date = {
    $gte: start,
    $lte: end,
    };
  }

  if (isBooked !== undefined) {
    filter.isBooked = isBooked === "true";
  }

  if (isBlocked !== undefined) {
    filter.isBlocked = isBlocked === "true";
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const total = await AvailabilitySlot.countDocuments(filter);

  const slots = await AvailabilitySlot.find(filter)
    .sort({ date: 1, startTime: 1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  const pagination = buildPagination(pageNum, limitNum, total);

  return sendSuccess(res, 200, "Availability slots fetched successfully.", { slots }, pagination);
});

// @desc    Get available (not booked, not blocked) slots for a specific doctor
// @route   GET /api/availability/available/:doctorId
// @access  Patient | Admin
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { role } = req.user;

  if (role !== "patient" && role !== "admin") {
    return sendError(res, 403, "Access denied.");
  }

  const { doctorId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(doctorId)) {
    return sendError(res, 400, "Invalid doctorId.");
  }

  const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
  if (!doctor) {
    return sendError(res, 404, "Doctor not found.");
  }

  const { date, page = 1, limit = 10 } = req.query;

  const filter = {
    doctorId,
    isBooked: false,
    isBlocked: false,
  };

  if (date) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return sendError(res, 400, "Invalid date format.");
    }
    const start = new Date(parsedDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(parsedDate);
    end.setHours(23, 59, 59, 999);

    filter.date = {
    $gte: start,
    $lte: end,
    };
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filter.date = {
    $gte: today,
    };
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const total = await AvailabilitySlot.countDocuments(filter);

  const slots = await AvailabilitySlot.find(filter)
    .sort({ date: 1, startTime: 1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  const pagination = buildPagination(pageNum, limitNum, total);

  return sendSuccess(res, 200, "Available slots fetched successfully.", slots, pagination);
});

// @desc    Update an availability slot
// @route   PUT /api/availability/:id
// @access  Doctor (own slot only)
const updateAvailabilitySlot = asyncHandler(async (req, res) => {
  const { role, _id: doctorId } = req.user;

  if (role !== "doctor") {
    return sendError(res, 403, "Only doctors can update availability slots.");
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, "Invalid slot ID.");
  }

  const slot = await AvailabilitySlot.findById(id);
  if (!slot) {
    return sendError(res, 404, "Availability slot not found.");
  }
  if (slot.isBlocked) {
    return sendError(
        res,
        400,
        "Cannot update a blocked slot."
  );
}

  if (String(slot.doctorId) !== String(doctorId)) {
    return sendError(res, 403, "Access denied. You can only update your own slots.");
  }

  if (slot.isBooked) {
    return sendError(res, 400, "Cannot update a slot that is already booked.");
  }

  const { date, startTime, endTime } = req.body;

  const updatedDate = date ? new Date(date) : slot.date;
  const updatedStartTime = startTime || slot.startTime;
  const updatedEndTime = endTime || slot.endTime;

  if (date && isNaN(updatedDate.getTime())) {
    return sendError(res, 400, "Invalid date format.");
  }

  if (updatedEndTime <= updatedStartTime) {
    return sendError(res, 400, "endTime must be after startTime.");
  }

  const duplicate = await AvailabilitySlot.findOne({
    _id: { $ne: id },
    doctorId,
    date: updatedDate,
    startTime: updatedStartTime,
    endTime: updatedEndTime,
  });

  if (duplicate) {
    return sendError(res, 409, "An availability slot already exists for this date and time.");
  }

  slot.date = updatedDate;
  slot.startTime = updatedStartTime;
  slot.endTime = updatedEndTime;
  await slot.save();

  return sendSuccess(res, 200, "Availability slot updated successfully.", { slot });
});

// @desc    Delete an availability slot
// @route   DELETE /api/availability/:id
// @access  Doctor (own slot only)
const deleteAvailabilitySlot = asyncHandler(async (req, res) => {
  const { role, _id: doctorId } = req.user;

  if (role !== "doctor") {
    return sendError(res, 403, "Only doctors can delete availability slots.");
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, "Invalid slot ID.");
  }

  const slot = await AvailabilitySlot.findById(id);
  if (!slot) {
    return sendError(res, 404, "Availability slot not found.");
  }

  if (String(slot.doctorId) !== String(doctorId)) {
    return sendError(res, 403, "Access denied. You can only delete your own slots.");
  }

  if (slot.isBooked) {
    return sendError(res, 400, "Cannot delete a slot that is already booked.");
  }

  await slot.deleteOne();

  return sendSuccess(res, 200, "Availability slot deleted successfully.", null);
});

// @desc    Block an availability slot
// @route   PATCH /api/availability/:id/block
// @access  Doctor (own slot) | Admin
const blockAvailabilitySlot = asyncHandler(async (req, res) => {
  const { role, _id: userId } = req.user;

  if (role !== "doctor" && role !== "admin") {
    return sendError(res, 403, "Access denied.");
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, "Invalid slot ID.");
  }

  const slot = await AvailabilitySlot.findById(id);
  if (!slot) {
    return sendError(res, 404, "Availability slot not found.");
  }

  if (role === "doctor" && String(slot.doctorId) !== String(userId)) {
    return sendError(res, 403, "Access denied. You can only block your own slots.");
  }

  if (slot.isBooked) {
    return sendError(res, 400, "Cannot block a slot that is already booked.");
  }

  if (slot.isBlocked) {
    return sendError(res, 400, "Slot is already blocked.");
  }

  slot.isBlocked = true;
  await slot.save();

  return sendSuccess(res, 200, "Availability slot blocked successfully.", { slot });
});

// @desc    Unblock an availability slot
// @route   PATCH /api/availability/:id/unblock
// @access  Doctor (own slot) | Admin
const unblockAvailabilitySlot = asyncHandler(async (req, res) => {
  const { role, _id: userId } = req.user;

  if (role !== "doctor" && role !== "admin") {
    return sendError(res, 403, "Access denied.");
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, "Invalid slot ID.");
  }

  const slot = await AvailabilitySlot.findById(id);
  if (!slot) {
    return sendError(res, 404, "Availability slot not found.");
  }

  if (role === "doctor" && String(slot.doctorId) !== String(userId)) {
    return sendError(res, 403, "Access denied. You can only unblock your own slots.");
  }

  if (!slot.isBlocked) {
    return sendError(res, 400, "Slot is not blocked.");
  }

  slot.isBlocked = false;
  await slot.save();

  return sendSuccess(res, 200, "Availability slot unblocked successfully.", { slot });
});

// @desc    Bulk create availability slots
// @route   POST /api/availability/bulk
// @access  Doctor
const createBulkAvailabilitySlots = asyncHandler(async (req, res) => {
  const { role, _id: doctorId } = req.user;

  if (role !== "doctor") {
    return sendError(res, 403, "Only doctors can create availability slots.");
  }

  const { slots } = req.body;

  if (!Array.isArray(slots) || slots.length === 0) {
    return sendError(res, 400, "slots must be a non-empty array.");
  }

  if (slots.length > 100) {
    return sendError(res, 400, "Cannot create more than 100 slots in a single request.");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Validate every slot upfront and collect errors before touching the database
  const validationErrors = [];

  slots.forEach((slot, index) => {
    const { date, startTime, endTime } = slot;

    if (!date || !startTime || !endTime) {
      validationErrors.push({
        index,
        message: "date, startTime, and endTime are required.",
      });
      return;
    }

    const slotDate = new Date(date);
    if (isNaN(slotDate.getTime())) {
      validationErrors.push({ index, message: "Invalid date format." });
      return;
    }

    slotDate.setHours(0, 0, 0, 0);
    if (slotDate < today) {
      validationErrors.push({
        index,
        message: "Cannot create availability slots in the past.",
      });
      return;
    }

    if (endTime <= startTime) {
      validationErrors.push({
        index,
        message: "endTime must be after startTime.",
      });
    }
  });

  if (validationErrors.length > 0) {
    return sendError(
      res,
      400,
      "One or more slots failed validation.",
      validationErrors
    );
  }

  // Normalize all slot dates to midnight for consistent duplicate checking
  const normalizedSlots = slots.map((slot) => {
    const slotDate = new Date(slot.date);
    slotDate.setHours(0, 0, 0, 0);
    return { date: slotDate, startTime: slot.startTime, endTime: slot.endTime };
  });

  // Fetch all existing slots for this doctor that overlap with any of the
  // requested dates in one query — avoids N individual duplicate checks
  const requestedDates = normalizedSlots.map((s) => s.date);

  const existingSlots = await AvailabilitySlot.find({
    doctorId,
    date: { $in: requestedDates },
  })
    .select("date startTime endTime")
    .lean();

  // Build a Set of composite keys for O(1) lookup
  // Key format: "YYYY-MM-DD|HH:MM|HH:MM"
  const existingKeys = new Set(
    existingSlots.map(
      (s) =>
        `${s.date.toISOString().slice(0, 10)}|${s.startTime}|${s.endTime}`
    )
  );

  const toInsert = [];
  let skippedCount = 0;

  normalizedSlots.forEach(({ date, startTime, endTime }) => {
    const key = `${date.toISOString().slice(0, 10)}|${startTime}|${endTime}`;

    if (existingKeys.has(key)) {
      skippedCount += 1;
      return;
    }

    // Also guard against duplicates within the request itself
    existingKeys.add(key);

    toInsert.push({
      doctorId,
      date,
      startTime,
      endTime,
      isBooked: false,
      isBlocked: false,
    });
  });

  // insertMany with ordered: false so one failed insert does not block others
  let createdSlots = [];
  if (toInsert.length > 0) {
    createdSlots = await AvailabilitySlot.insertMany(toInsert, {
      ordered: false,
    });
  }

  return sendSuccess(res, 201, "Bulk availability slots processed successfully.", {
    createdCount: createdSlots.length,
    skippedCount,
    createdSlots,
  });
});

module.exports = {
  createAvailabilitySlot,
  createBulkAvailabilitySlots,
  getDoctorAvailability,
  getAvailableSlots,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
  blockAvailabilitySlot,
  unblockAvailabilitySlot,
};