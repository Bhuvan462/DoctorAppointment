// controllers/appointment.controller.js

const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const AvailabilitySlot = require("../models/AvailabilitySlot");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { sendSuccess, sendError, buildPagination } = require("../utils/apiResponse");
const { sendEmail } = require("../services/email/email.service");

const getDateRangeFromPreset = (preset) => {
  const now = new Date();

  if (preset === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  if (preset === "tomorrow") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start, end };
  }

  if (preset === "this_week") {
    const day = now.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
  }

  if (preset === "this_month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { start, end };
  }

  return null;
};

// @desc    Book a new appointment
// @route   POST /api/appointments/book
// @access  Patient
const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, slotId, type, reasonForVisit } = req.body;
  const patientId = req.user._id;

  if (req.user.role !== "patient") {
    return sendError(res, 403, "Only patients can book appointments.");
  }

  if (!["in-person", "online"].includes(type)) {
  return sendError(
    res,
    400,
    'type must be either "in-person" or "online".'
  );
}

  if (!mongoose.Types.ObjectId.isValid(doctorId) || !mongoose.Types.ObjectId.isValid(slotId)) {
    return sendError(res, 400, "Invalid doctorId or slotId.");
  }

  const doctor = await User.findOne({ _id: doctorId, role: "doctor" });
  if (!doctor) {
    return sendError(res, 404, "Doctor not found.");
  }

  const slot = await AvailabilitySlot.findOneAndUpdate(
    { _id: slotId, doctorId, isBooked: false, isBlocked: false },
    { isBooked: true },
    { new: true }
  );

  if (!slot) {
    const nextSlot = await AvailabilitySlot.findOne({
      doctorId,
      isBooked: false,
      isBlocked: false,
      date: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    }).sort({ date: 1, startTime: 1 });

    return res.status(409).json({
      success: false,
      message: "Slot is unavailable or already booked.",
      nextAvailableSlot: nextSlot || null
    });
  }

  if (String(slot.doctorId) !== String(doctorId)) {
    return sendError(res, 400, "Slot does not belong to this doctor.");
  }

  const existing = await Appointment.findOne({
    patientId,
    slotId,
    status: { $nin: ["cancelled", "rejected"] },
  });
  if (existing) {
    return sendError(res, 409, "You already have an active appointment for this slot.");
  }

  const tokenNumber = `TKN-${Math.floor(1000 + Math.random() * 9000)}`;

  const appointment = await Appointment.create({
    patientId,
    doctorId,
    slotId,
    appointmentDate: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    type,
    reasonForVisit: reasonForVisit || "",
    status: "pending",
    tokenNumber,
    reminderSent: false,
  });

  const patient = await User.findById(patientId);

  await Notification.create({
    userId: patientId,
    title: "Appointment Requested",
    message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been requested and is pending confirmation.`,
    type: "general",
    relatedId: appointment._id,
    relatedModel: "Appointment",
  });

  await Notification.create({
    userId: doctorId,
    title: "New Appointment Request",
    message: `You have a new appointment request from ${patient.firstName} ${patient.lastName}.`,
    type: "general",
    relatedId: appointment._id,
    relatedModel: "Appointment",
  });

  sendEmail(patient.email, 'appointmentBooked', {
    name: patient.firstName,
    details: {
      Doctor: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      Date: slot.date.toDateString(),
      Time: `${slot.startTime} - ${slot.endTime}`,
      Type: type
    }
  }).catch(err => console.error(err));

  return sendSuccess(res, 201, "Appointment booked successfully.", { appointment });
});

// @desc    Get patient's appointments
// @route   GET /api/appointments/patient
// @access  Patient
const getPatientAppointments = asyncHandler(async (req, res) => {
  if (req.user.role !== "patient") {
    return sendError(res, 403, "Access denied.");
  }

  const userId = req.user._id;
  const { status, type, startDate, endDate, page = 1, limit = 10 } = req.query;

  const filter = { patientId: userId };

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.appointmentDate = {};
    if (startDate) filter.appointmentDate.$gte = new Date(startDate);
    if (endDate) filter.appointmentDate.$lte = new Date(endDate);
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const total = await Appointment.countDocuments(filter);

  const appointments = await Appointment.find(filter)
    .populate("doctorId", "firstName lastName email phone profilePhoto")
    .populate("slotId", "date startTime endTime isBooked isBlocked")
    .sort({ appointmentDate: -1, startTime: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  const pagination = buildPagination(pageNum, limitNum, total);

  return sendSuccess(res, 200, "Appointments fetched successfully.", { appointments }, pagination);
});

// @desc    Get doctor's appointments
// @route   GET /api/appointments/doctor
// @access  Doctor
const getDoctorAppointments = asyncHandler(async (req, res) => {
  if (req.user.role !== "doctor") {
    return sendError(res, 403, "Access denied.");
  }

  const userId = req.user._id;
  const { status, type, startDate, endDate, dateFilter, search, page = 1, limit = 10 } = req.query;

  const filter = { doctorId: userId };

  if (status) filter.status = status;
  if (type) filter.type = type;

  if (dateFilter && dateFilter !== "all" && !startDate && !endDate) {
    const range = getDateRangeFromPreset(dateFilter);
    if (range) {
      filter.appointmentDate = { $gte: range.start, $lt: range.end };
    }
  }

  if (startDate || endDate) {
    filter.appointmentDate = {};
    if (startDate) filter.appointmentDate.$gte = new Date(startDate);
    if (endDate) filter.appointmentDate.$lte = new Date(endDate);
  }

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    const matchedPatients = await User.find(
      {
        role: "patient",
        $or: [
          { firstName: regex },
          { lastName: regex },
          { email: regex },
          { phone: regex },
        ],
      },
      { _id: 1 }
    ).lean();

    if (matchedPatients.length === 0) {
      return sendSuccess(
        res,
        200,
        "Appointments fetched successfully.",
        { appointments: [] },
        buildPagination(1, Math.max(1, parseInt(limit)), 0)
      );
    }

    filter.patientId = { $in: matchedPatients.map((p) => p._id) };
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const total = await Appointment.countDocuments(filter);

  const appointments = await Appointment.find(filter)
    .populate("patientId", "firstName lastName email phone profilePhoto gender")
    .populate("slotId", "date startTime endTime isBooked isBlocked")
    .sort({ appointmentDate: -1, startTime: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  const pagination = buildPagination(pageNum, limitNum, total);

  return sendSuccess(res, 200, "Appointments fetched successfully.", { appointments }, pagination);
});

// @desc    Get all appointments
// @route   GET /api/appointments/all
// @access  Admin
const getAllAppointments = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    return sendError(res, 403, "Access denied.");
  }

  const { status, type, startDate, endDate, doctorId, patientId, page = 1, limit = 10 } = req.query;

  const filter = {};

  if (status) filter.status = status;
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.appointmentDate = {};
    if (startDate) filter.appointmentDate.$gte = new Date(startDate);
    if (endDate) filter.appointmentDate.$lte = new Date(endDate);
  }
  if (doctorId) {
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return sendError(res, 400, "Invalid doctorId.");
    }
    filter.doctorId = doctorId;
  }
  if (patientId) {
    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return sendError(res, 400, "Invalid patientId.");
    }
    filter.patientId = patientId;
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const total = await Appointment.countDocuments(filter);

  const appointments = await Appointment.find(filter)
    .populate("patientId", "firstName lastName email phone profilePhoto gender")
    .populate("doctorId", "firstName lastName email phone profilePhoto")
    .populate("slotId", "date startTime endTime isBooked isBlocked")
    .sort({ appointmentDate: -1, startTime: -1 })
    .skip(skip)
    .limit(limitNum)
    .lean();

  const pagination = buildPagination(pageNum, limitNum, total);

  return sendSuccess(res, 200, "Appointments fetched successfully.", { appointments }, pagination);
});

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Patient (own) | Doctor (own) | Admin
const getAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, _id: userId } = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, "Invalid appointment ID.");
  }

  const appointment = await Appointment.findById(id)
    .populate("patientId", "firstName lastName email phone profilePhoto gender dateOfBirth")
    .populate("doctorId", "firstName lastName email phone profilePhoto")
    .populate("slotId", "date startTime endTime isBooked isBlocked")
    .lean();

  if (!appointment) {
    return sendError(res, 404, "Appointment not found.");
  }

  if (role === "patient" && String(appointment.patientId._id) !== String(userId)) {
    return sendError(res, 403, "Access denied.");
  }

  if (role === "doctor" && String(appointment.doctorId._id) !== String(userId)) {
    return sendError(res, 403, "Access denied.");
  }

  return sendSuccess(res, 200, "Appointment fetched successfully.", { appointment });
});

// @desc    Confirm appointment
// @route   PATCH /api/appointments/:id/confirm
// @access  Doctor
const confirmAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, _id: doctorId } = req.user;

  if (role !== "doctor") {
    return sendError(res, 403, "Only doctors can confirm appointments.");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, "Invalid appointment ID.");
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return sendError(res, 404, "Appointment not found.");
  }

  if (String(appointment.doctorId) !== String(doctorId)) {
    return sendError(res, 403, "Access denied.");
  }

  if (appointment.status !== "pending") {
    return sendError(res, 400, `Cannot confirm an appointment with status '${appointment.status}'.`);
  }

  appointment.status = "confirmed";
  await appointment.save();

  await Notification.create({
    userId: appointment.patientId,
    title: "Appointment Confirmed",
    message: `Your appointment on ${appointment.appointmentDate.toDateString()} at ${appointment.startTime} has been confirmed.`,
    type: "booking_confirmed",
    relatedId: appointment._id,
    relatedModel: "Appointment",
  });

  return sendSuccess(res, 200, "Appointment confirmed successfully.", { appointment });
});

// @desc    Reject appointment
// @route   PATCH /api/appointments/:id/reject
// @access  Doctor
const rejectAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, _id: doctorId } = req.user;
  const { cancellationReason } = req.body;

  if (role !== "doctor") {
    return sendError(res, 403, "Only doctors can reject appointments.");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, "Invalid appointment ID.");
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return sendError(res, 404, "Appointment not found.");
  }

  if (String(appointment.doctorId) !== String(doctorId)) {
    return sendError(res, 403, "Access denied.");
  }

  if (appointment.status !== "pending") {
    return sendError(res, 400, `Cannot reject an appointment with status '${appointment.status}'.`);
  }

  appointment.status = "rejected";
  appointment.cancelledBy = doctorId;
  appointment.cancellationReason = cancellationReason || "";
  appointment.cancelledAt = new Date();
  await appointment.save();

  await AvailabilitySlot.findByIdAndUpdate(appointment.slotId, { isBooked: false });

  await Notification.create({
    userId: appointment.patientId,
    title: "Appointment Rejected",
    message: `Your appointment on ${appointment.appointmentDate.toDateString()} at ${appointment.startTime} was rejected by the doctor. Reason: ${cancellationReason || "Not provided"}.`,
    type: "appointment_rejected",
    relatedId: appointment._id,
    relatedModel: "Appointment",
  });

  return sendSuccess(res, 200, "Appointment rejected successfully.", { appointment });
});

// @desc    Cancel appointment
// @route   PATCH /api/appointments/:id/cancel
// @access  Patient | Doctor | Admin
const cancelAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, _id: userId } = req.user;
  const { cancellationReason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, "Invalid appointment ID.");
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return sendError(res, 404, "Appointment not found.");
  }

  if (role === "patient" && String(appointment.patientId) !== String(userId)) {
    return sendError(res, 403, "Access denied.");
  }
  if (role === "doctor" && String(appointment.doctorId) !== String(userId)) {
    return sendError(res, 403, "Access denied.");
  }

  const cancellableStatuses = ["pending", "confirmed"];
  if (!cancellableStatuses.includes(appointment.status)) {
    return sendError(res, 400, `Cannot cancel an appointment with status '${appointment.status}'.`);
  }

  appointment.status = "cancelled";
  appointment.cancelledBy = userId;
  appointment.cancellationReason = cancellationReason || "";
  appointment.cancelledAt = new Date();
  await appointment.save();

  await AvailabilitySlot.findByIdAndUpdate(appointment.slotId, { isBooked: false });

  const notifyUserId =
    role === "patient" ? appointment.doctorId : appointment.patientId;

  const cancellerLabel =
    role === "patient" ? "the patient" : role === "doctor" ? "the doctor" : "an admin";

  await Notification.create({
    userId: notifyUserId,
    title: "Appointment Cancelled",
    message: `An appointment on ${appointment.appointmentDate.toDateString()} at ${appointment.startTime} was cancelled by ${cancellerLabel}. Reason: ${cancellationReason || "Not provided"}.`,
    type: "appointment_cancelled",
    relatedId: appointment._id,
    relatedModel: "Appointment",
  });

  if (role === "patient") {
    await Notification.create({
      userId: appointment.patientId,
      title: "Appointment Cancelled",
      message: `You have cancelled your appointment on ${appointment.appointmentDate.toDateString()} at ${appointment.startTime}.`,
      type: "appointment_cancelled",
      relatedId: appointment._id,
      relatedModel: "Appointment",
    });
  }

  return sendSuccess(res, 200, "Appointment cancelled successfully.", { appointment });
});

// @desc    Reschedule appointment
// @route   PATCH /api/appointments/:id/reschedule
// @access  Patient
const rescheduleAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, _id: patientId } = req.user;
  const { slotId } = req.body;

  if (role !== "patient") {
    return sendError(res, 403, "Only patients can reschedule appointments.");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, "Invalid appointment ID.");
  }

  if (!slotId) {
    return sendError(res, 400, "slotId is required.");
  }

  if (!mongoose.Types.ObjectId.isValid(slotId)) {
    return sendError(res, 400, "Invalid slotId.");
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return sendError(res, 404, "Appointment not found.");
  }

  if (String(appointment.patientId) !== String(patientId)) {
    return sendError(res, 403, "Access denied.");
  }

  if (!["pending", "confirmed"].includes(appointment.status)) {
    return sendError(res, 400, `Cannot reschedule an appointment with status '${appointment.status}'.`);
  }

  const newSlot = await AvailabilitySlot.findOneAndUpdate(
    { _id: slotId, doctorId: appointment.doctorId, isBooked: false, isBlocked: false },
    { isBooked: true },
    { new: true }
  );

  if (!newSlot) {
    return sendError(res, 409, "The selected slot is unavailable or already booked.");
  }

  await AvailabilitySlot.findByIdAndUpdate(appointment.slotId, { isBooked: false });

  const previousSlotId = appointment.slotId;

  appointment.rescheduledFrom = previousSlotId;
  appointment.slotId = newSlot._id;
  appointment.appointmentDate = newSlot.date;
  appointment.startTime = newSlot.startTime;
  appointment.endTime = newSlot.endTime;
  appointment.status = "pending";
  await appointment.save();

  const doctor = await User.findById(appointment.doctorId);

  await Notification.create({
    userId: patientId,
    title: "Appointment Rescheduled",
    message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been rescheduled to ${newSlot.date.toDateString()} at ${newSlot.startTime}.`,
    type: "appointment_rescheduled",
    relatedId: appointment._id,
    relatedModel: "Appointment",
  });

  await Notification.create({
    userId: appointment.doctorId,
    title: "Appointment Rescheduled",
    message: `A patient has rescheduled their appointment to ${newSlot.date.toDateString()} at ${newSlot.startTime}.`,
    type: "appointment_rescheduled",
    relatedId: appointment._id,
    relatedModel: "Appointment",
  });

  return sendSuccess(res, 200, "Appointment rescheduled successfully.", { appointment });
});

// @desc    Complete appointment
// @route   PATCH /api/appointments/:id/complete
// @access  Doctor
const completeAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, _id: doctorId } = req.user;

  if (role !== "doctor") {
    return sendError(res, 403, "Only doctors can mark appointments as completed.");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, "Invalid appointment ID.");
  }

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return sendError(res, 404, "Appointment not found.");
  }

  if (String(appointment.doctorId) !== String(doctorId)) {
    return sendError(res, 403, "Access denied.");
  }

  if (appointment.status !== "confirmed") {
    return sendError(res, 400, `Cannot complete an appointment with status '${appointment.status}'.`);
  }

  appointment.status = "completed";
  await appointment.save();

  await Notification.create({
    userId: appointment.patientId,
    title: "Appointment Completed",
    message: `Your appointment on ${appointment.appointmentDate.toDateString()} at ${appointment.startTime} has been marked as completed.`,
    type: "appointment_completed",
    relatedId: appointment._id,
    relatedModel: "Appointment",
  });

  return sendSuccess(res, 200, "Appointment marked as completed.", { appointment });
});

module.exports = {
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
};