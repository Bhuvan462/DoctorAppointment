const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const ConsultationRecord = require('../models/ConsultationRecord');
const Appointment = require('../models/Appointment');
const { sendSuccess, sendError, buildPagination } = require('../utils/apiResponse');

/**
 * @desc    Get consultation history for the authenticated patient
 * @route   GET /api/v1/consultations/patient/history
 * @access  Private — patient only
 */
const getPatientConsultationHistory = asyncHandler(async (req, res) => {
  if (req.user.role !== 'patient') {
    return sendError(res, 403, 'Access denied. This endpoint is for patients only.');
  }

  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip  = (page - 1) * limit;

  const filter = { patientId: req.user._id };

  const [consultations, totalCount] = await Promise.all([
    ConsultationRecord.find(filter)
      .populate('doctorId', 'firstName lastName email phone profilePhoto')
      .populate({
        path: 'appointmentId',
        select: 'appointmentDate startTime endTime type status',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ConsultationRecord.countDocuments(filter),
  ]);

  return sendSuccess(
    res,
    200,
    'Consultation history retrieved successfully.',
    consultations,
    buildPagination(page, limit, totalCount)
  );
});

/**
 * @desc    Get consultation records for the authenticated doctor
 * @route   GET /api/v1/consultations/doctor/records
 * @access  Private — doctor only
 */
const getDoctorConsultationRecords = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    return sendError(res, 403, 'Access denied. This endpoint is for doctors only.');
  }

  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip  = (page - 1) * limit;

  const filter = { doctorId: req.user._id };

  const [consultations, totalCount] = await Promise.all([
    ConsultationRecord.find(filter)
      .populate('patientId', 'firstName lastName email phone profilePhoto gender dateOfBirth')
      .populate({
        path: 'appointmentId',
        select: 'appointmentDate startTime endTime type status',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ConsultationRecord.countDocuments(filter),
  ]);

  return sendSuccess(
    res,
    200,
    'Consultation records retrieved successfully.',
    consultations,
    buildPagination(page, limit, totalCount)
  );
});

/**
 * @desc    Get a single consultation record by appointment ID
 * @route   GET /api/v1/consultations/:appointmentId
 * @access  Private — patient (own) | doctor (own) | admin
 */
const getConsultationByAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    return sendError(res, 400, 'Invalid appointment ID.');
  }

  const consultation = await ConsultationRecord.findOne({ appointmentId })
    .populate('doctorId', 'firstName lastName email phone profilePhoto')
    .populate('patientId', 'firstName lastName email phone profilePhoto gender dateOfBirth')
    .populate({
      path: 'appointmentId',
      select: 'appointmentDate startTime endTime type status reasonForVisit',
    })
    .lean();

  if (!consultation) {
    return sendError(res, 404, 'Consultation record not found.');
  }

  // Access control — only the patient, the doctor, or an admin can view
  const userId = String(req.user._id);
  const role   = req.user.role;

  if (
    role !== 'admin' &&
    String(consultation.patientId._id) !== userId &&
    String(consultation.doctorId._id) !== userId
  ) {
    return sendError(res, 403, 'Access denied.');
  }

  return sendSuccess(res, 200, 'Consultation record retrieved successfully.', consultation);
});

/**
 * @desc    Create a consultation record (via appointments controller is the primary path,
 *          but this endpoint also supports direct creation from the doctor's ConsultationRecord page)
 * @route   POST /api/v1/consultations
 * @access  Private — doctor only
 */
const createConsultationRecord = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    return sendError(res, 403, 'Only doctors can create consultation records.');
  }

  const {
    appointmentId,
    diagnosis,
    symptoms,
    notes,
    vitalSigns,
    followUpRequired,
    followUpDate,
    followUpNotes,
    attachments,
  } = req.body;

  if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
    return sendError(res, 400, 'A valid appointmentId is required.');
  }

  if (!diagnosis || !Array.isArray(symptoms)) {
    return sendError(res, 400, 'diagnosis is required and symptoms must be an array.');
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return sendError(res, 404, 'Appointment not found.');
  }

  if (String(appointment.doctorId) !== String(req.user._id)) {
    return sendError(res, 403, 'Access denied. This appointment does not belong to you.');
  }

  if (appointment.status !== 'completed') {
    return sendError(res, 400, 'Consultation records can only be created for completed appointments.');
  }

  const existing = await ConsultationRecord.findOne({ appointmentId });
  if (existing) {
    return sendError(res, 409, 'A consultation record already exists for this appointment.');
  }

  const data = {
    appointmentId: appointment._id,
    patientId: appointment.patientId,
    doctorId: appointment.doctorId,
    diagnosis,
    symptoms,
  };

  if (notes !== undefined)           data.notes = notes;
  if (vitalSigns !== undefined)      data.vitalSigns = vitalSigns;
  if (followUpRequired !== undefined) data.followUpRequired = followUpRequired;
  if (followUpDate !== undefined)    data.followUpDate = new Date(followUpDate);
  if (followUpNotes !== undefined)   data.followUpNotes = followUpNotes;
  if (attachments !== undefined)     data.attachments = attachments;

  const consultation = await ConsultationRecord.create(data);

  return sendSuccess(res, 201, 'Consultation record created successfully.', consultation);
});

/**
 * @desc    Update an existing consultation record
 * @route   PUT /api/v1/consultations/:id
 * @access  Private — doctor (own record only)
 */
const updateConsultationRecord = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    return sendError(res, 403, 'Only doctors can update consultation records.');
  }

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, 'Invalid consultation ID.');
  }

  const consultation = await ConsultationRecord.findById(id);
  if (!consultation) {
    return sendError(res, 404, 'Consultation record not found.');
  }

  if (String(consultation.doctorId) !== String(req.user._id)) {
    return sendError(res, 403, 'Access denied. You can only update your own records.');
  }

  const allowedFields = [
    'diagnosis', 'symptoms', 'notes', 'vitalSigns',
    'followUpRequired', 'followUpDate', 'followUpNotes', 'attachments',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (Object.keys(updates).length === 0) {
    return sendError(res, 400, 'No valid fields provided to update.');
  }

  const updated = await ConsultationRecord.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).lean();

  return sendSuccess(res, 200, 'Consultation record updated successfully.', updated);
});

module.exports = {
  getPatientConsultationHistory,
  getDoctorConsultationRecords,
  getConsultationByAppointment,
  createConsultationRecord,
  updateConsultationRecord,
};
