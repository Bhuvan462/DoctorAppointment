const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Prescription = require('../models/Prescription');
const ConsultationRecord = require('../models/ConsultationRecord');
const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const { sendSuccess, sendError, buildPagination } = require('../utils/apiResponse');
const { cloudinary } = require('../config/cloudinary');

const uploadBufferToCloudinary = (buffer, publicId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'medibook/prescriptions',
        public_id: publicId,
        overwrite: true,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, format: result.format || 'pdf' });
      }
    );
    stream.end(buffer);
  });
};

/**
 * @desc    Get all prescriptions for the authenticated patient
 * @route   GET /api/v1/prescriptions/patient
 * @access  Private — patient only
 */
const getPatientPrescriptions = asyncHandler(async (req, res) => {
  if (req.user.role !== 'patient') {
    return sendError(res, 403, 'Access denied. This endpoint is for patients only.');
  }

  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip  = (page - 1) * limit;

  const filter = { patientId: req.user._id };

  const [prescriptions, totalCount] = await Promise.all([
    Prescription.find(filter)
      .populate('doctorId', 'firstName lastName email phone profilePhoto')
      .populate({
        path: 'appointmentId',
        select: 'appointmentDate startTime endTime type status',
      })
      .sort({ issuedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Prescription.countDocuments(filter),
  ]);

  return sendSuccess(
    res,
    200,
    'Prescriptions retrieved successfully.',
    prescriptions,
    buildPagination(page, limit, totalCount)
  );
});

/**
 * @desc    Get prescriptions issued by the authenticated doctor
 * @route   GET /api/v1/prescriptions/doctor
 * @access  Private — doctor only
 */
const getDoctorPrescriptions = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    return sendError(res, 403, 'Access denied. This endpoint is for doctors only.');
  }

  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
  const skip  = (page - 1) * limit;

  const filter = { doctorId: req.user._id };

  const [prescriptions, totalCount] = await Promise.all([
    Prescription.find(filter)
      .populate('patientId', 'firstName lastName email phone profilePhoto gender dateOfBirth')
      .populate({
        path: 'appointmentId',
        select: 'appointmentDate startTime endTime type status',
      })
      .sort({ issuedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Prescription.countDocuments(filter),
  ]);

  return sendSuccess(
    res,
    200,
    'Prescriptions retrieved successfully.',
    prescriptions,
    buildPagination(page, limit, totalCount)
  );
});

/**
 * @desc    Get a single prescription by ID
 * @route   GET /api/v1/prescriptions/:id
 * @access  Private — patient (own) | doctor (own) | admin
 */
const getPrescriptionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, 'Invalid prescription ID.');
  }

  const prescription = await Prescription.findById(id)
    .populate('doctorId', 'firstName lastName email phone profilePhoto')
    .populate('patientId', 'firstName lastName email phone profilePhoto gender dateOfBirth')
    .populate({
      path: 'appointmentId',
      select: 'appointmentDate startTime endTime type status',
    })
    .lean();

  if (!prescription) {
    return sendError(res, 404, 'Prescription not found.');
  }

  const userId = String(req.user._id);
  const role   = req.user.role;

  if (
    role !== 'admin' &&
    String(prescription.patientId._id) !== userId &&
    String(prescription.doctorId._id) !== userId
  ) {
    return sendError(res, 403, 'Access denied.');
  }

  return sendSuccess(res, 200, 'Prescription retrieved successfully.', prescription);
});

/**
 * @desc    Issue a new prescription
 * @route   POST /api/v1/prescriptions
 * @access  Private — doctor only
 */
const issuePrescription = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    return sendError(res, 403, 'Only doctors can issue prescriptions.');
  }

  const { consultationId, appointmentId, medications, additionalNotes } = req.body;

  if (!consultationId || !mongoose.Types.ObjectId.isValid(consultationId)) {
    return sendError(res, 400, 'A valid consultationId is required.');
  }

  if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
    return sendError(res, 400, 'A valid appointmentId is required.');
  }

  if (!Array.isArray(medications) || medications.length === 0) {
    return sendError(res, 400, 'At least one medication is required.');
  }

  const consultation = await ConsultationRecord.findById(consultationId);
  if (!consultation) {
    return sendError(res, 404, 'Consultation record not found.');
  }

  if (String(consultation.doctorId) !== String(req.user._id)) {
    return sendError(res, 403, 'Access denied. You can only issue prescriptions for your own consultations.');
  }

  const prescription = await Prescription.create({
    consultationId,
    appointmentId,
    doctorId: req.user._id,
    patientId: consultation.patientId,
    medications,
    additionalNotes: additionalNotes || '',
    issuedAt: new Date(),
  });

  // Notify the patient
  await Notification.create({
    userId: consultation.patientId,
    title: 'Prescription Ready',
    message: 'Your doctor has issued a prescription. You can view it in the Prescriptions section.',
    type: 'prescription_ready',
    relatedId: prescription._id,
    relatedModel: 'Prescription',
  });

  return sendSuccess(res, 201, 'Prescription issued successfully.', prescription);
});

/**
 * @desc    Upload a prescription file
 * @route   POST /api/v1/prescriptions/upload/:appointmentId
 * @access  Private — doctor only
 */
const uploadPrescription = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    return sendError(res, 403, 'Only doctors can upload prescriptions.');
  }

  const { appointmentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    return sendError(res, 400, 'Invalid appointment ID.');
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    return sendError(res, 404, 'Appointment not found.');
  }

  if (String(appointment.doctorId) !== String(req.user._id)) {
    return sendError(res, 403, 'Access denied.');
  }

  if (appointment.status !== 'completed') {
    return sendError(res, 400, 'Prescriptions can only be uploaded for completed appointments.');
  }

  if (!req.file) {
    return sendError(res, 400, 'No prescription file provided.');
  }

  const fileExt = req.file.mimetype === 'application/pdf' ? 'pdf' : req.file.mimetype.split('/')[1];
  const publicId = `prescription_${appointmentId}_${Date.now()}`;

  const uploadResult = await uploadBufferToCloudinary(req.file.buffer, publicId);

  // Check if a prescription already exists for this appointment
  let prescription = await Prescription.findOne({ appointmentId });

  if (prescription) {
    prescription.fileUrl = uploadResult.url;
    prescription.fileType = uploadResult.format;
    prescription.fileName = req.file.originalname;
    prescription.issuedAt = new Date();
    await prescription.save();
  } else {
    prescription = await Prescription.create({
      appointmentId,
      doctorId: req.user._id,
      patientId: appointment.patientId,
      fileUrl: uploadResult.url,
      fileType: uploadResult.format,
      fileName: req.file.originalname,
      issuedAt: new Date(),
    });
  }

  // Notify patient
  await Notification.create({
    userId: appointment.patientId,
    title: 'Prescription Uploaded',
    message: 'Your doctor has uploaded a prescription for your recent appointment.',
    type: 'prescription_ready',
    relatedId: prescription._id,
    relatedModel: 'Prescription',
  });

  return sendSuccess(res, 200, 'Prescription uploaded successfully.', prescription);
});

/**
 * @desc    Get prescription by appointment ID
 * @route   GET /api/v1/prescriptions/appointment/:appointmentId
 * @access  Private — patient (own) | doctor (own) | admin
 */
const getPrescriptionByAppointmentId = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
    return sendError(res, 400, 'Invalid appointment ID.');
  }

  const prescription = await Prescription.findOne({ appointmentId })
    .populate('doctorId', 'firstName lastName email phone profilePhoto')
    .populate('patientId', 'firstName lastName email phone profilePhoto gender dateOfBirth')
    .populate({
      path: 'appointmentId',
      select: 'appointmentDate startTime endTime type status',
    })
    .lean();

  if (!prescription) {
    return sendError(res, 404, 'Prescription not found.');
  }

  const userId = String(req.user._id);
  const role   = req.user.role;

  if (
    role !== 'admin' &&
    String(prescription.patientId._id) !== userId &&
    String(prescription.doctorId._id) !== userId
  ) {
    return sendError(res, 403, 'Access denied.');
  }

  return sendSuccess(res, 200, 'Prescription retrieved successfully.', prescription);
});

module.exports = {
  getPatientPrescriptions,
  getDoctorPrescriptions,
  getPrescriptionById,
  getPrescriptionByAppointmentId,
  issuePrescription,
  uploadPrescription,
};
