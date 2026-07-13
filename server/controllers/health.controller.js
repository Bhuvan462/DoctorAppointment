const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const HealthRecord = require('../models/HealthRecord');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * @desc    Get logged in patient's health record
 * @route   GET /api/v1/health
 * @access  Private — patient only
 */
const getMyHealthRecord = asyncHandler(async (req, res) => {
  if (req.user.role !== 'patient') {
    return sendError(res, 403, 'Access denied.');
  }

  let record = await HealthRecord.findOne({ patientId: req.user._id })
    .populate('treatingDoctor', 'firstName lastName profilePhoto')
    .populate('vitals.bloodPressure.doctorId', 'firstName lastName')
    .populate('vitals.bloodSugar.doctorId', 'firstName lastName')
    .populate('vitals.heartRate.doctorId', 'firstName lastName')
    .populate('vitals.oxygenSaturation.doctorId', 'firstName lastName')
    .populate('vitals.bodyTemperature.doctorId', 'firstName lastName')
    .populate('medicalNotes.doctorId', 'firstName lastName')
    .populate('diagnoses.doctorId', 'firstName lastName')
    .populate('treatmentHistory.doctorId', 'firstName lastName');

  if (!record) {
    // Create an empty record if it doesn't exist
    record = await HealthRecord.create({ patientId: req.user._id });
  }

  return sendSuccess(res, 200, 'Health record retrieved successfully.', record);
});

/**
 * @desc    Update patient's basic health info (by patient)
 * @route   PUT /api/v1/health
 * @access  Private — patient only
 */
const updateMyHealthInfo = asyncHandler(async (req, res) => {
  if (req.user.role !== 'patient') {
    return sendError(res, 403, 'Access denied.');
  }

  const {
    bloodGroup, height, weight, allergies,
    currentMedications, chronicDiseases,
    emergencyContact, lifestyleInfo
  } = req.body;

  let record = await HealthRecord.findOne({ patientId: req.user._id });

  if (!record) {
    record = new HealthRecord({ patientId: req.user._id });
  }

  // Update only allowed fields
  if (bloodGroup !== undefined) record.bloodGroup = bloodGroup;
  if (height !== undefined) record.height = height;
  if (weight !== undefined) record.weight = weight;
  if (allergies !== undefined) record.allergies = allergies;
  if (currentMedications !== undefined) record.currentMedications = currentMedications;
  if (chronicDiseases !== undefined) record.chronicDiseases = chronicDiseases;
  if (emergencyContact !== undefined) record.emergencyContact = emergencyContact;
  if (lifestyleInfo !== undefined) record.lifestyleInfo = lifestyleInfo;

  await record.save();

  return sendSuccess(res, 200, 'Health record updated successfully.', record);
});

/**
 * @desc    Get specific patient's health record (Doctor/Admin)
 * @route   GET /api/v1/health/patient/:patientId
 * @access  Private — doctor, admin
 */
const getPatientHealthRecord = asyncHandler(async (req, res) => {
  if (req.user.role === 'patient') {
    return sendError(res, 403, 'Access denied.');
  }

  const { patientId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return sendError(res, 400, 'Invalid patient ID.');
  }

  let record = await HealthRecord.findOne({ patientId })
    .populate('patientId', 'firstName lastName dateOfBirth gender profilePhoto email phone')
    .populate('treatingDoctor', 'firstName lastName profilePhoto')
    .populate('vitals.bloodPressure.doctorId', 'firstName lastName')
    .populate('vitals.bloodSugar.doctorId', 'firstName lastName')
    .populate('vitals.heartRate.doctorId', 'firstName lastName')
    .populate('vitals.oxygenSaturation.doctorId', 'firstName lastName')
    .populate('vitals.bodyTemperature.doctorId', 'firstName lastName')
    .populate('medicalNotes.doctorId', 'firstName lastName')
    .populate('diagnoses.doctorId', 'firstName lastName')
    .populate('treatmentHistory.doctorId', 'firstName lastName');

  if (!record) {
    record = await HealthRecord.create({ patientId });
    // Re-populate to match schema response
    record = await record.populate('patientId', 'firstName lastName dateOfBirth gender profilePhoto email phone');
  }

  return sendSuccess(res, 200, 'Health record retrieved successfully.', record);
});

/**
 * @desc    Append medical data to patient's health record (Doctor)
 * @route   POST /api/v1/health/patient/:patientId/data
 * @access  Private — doctor only
 */
const appendMedicalData = asyncHandler(async (req, res) => {
  if (req.user.role !== 'doctor') {
    return sendError(res, 403, 'Only doctors can append medical data.');
  }

  const { patientId } = req.params;
  const { type, value, date, time } = req.body; // type can be vital name or note type

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return sendError(res, 400, 'Invalid patient ID.');
  }

  let record = await HealthRecord.findOne({ patientId });
  if (!record) {
    record = new HealthRecord({ patientId });
  }

  const newEntry = {
    value,
    date: date || new Date(),
    time: time || new Date().toTimeString().substring(0, 5),
    doctorId: req.user._id
  };

  const newNoteEntry = {
    note: value,
    date: date || new Date(),
    doctorId: req.user._id
  };

  // Switch based on type
  switch (type) {
    case 'bloodPressure':
    case 'bloodSugar':
    case 'heartRate':
    case 'oxygenSaturation':
    case 'bodyTemperature':
      record.vitals[type].push(newEntry);
      break;
    case 'medicalNotes':
    case 'diagnoses':
    case 'treatmentHistory':
      record[type].push(newNoteEntry);
      break;
    default:
      return sendError(res, 400, 'Invalid data type.');
  }

  record.treatingDoctor = req.user._id;
  record.lastConsultationDate = new Date();

  await record.save();

  // Optionally send email notification to patient here in a real app

  return sendSuccess(res, 200, 'Data appended successfully.', record);
});

module.exports = {
  getMyHealthRecord,
  updateMyHealthInfo,
  getPatientHealthRecord,
  appendMedicalData
};
