const Notification = require('../models/Notification');

/**
 * Core function to create an in-app notification
 * @param {string} userId - Recipient user ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type (from enum)
 * @param {string|null} relatedId - Related document ID (optional)
 * @param {string|null} relatedModel - Related model name (optional)
 * @returns {Promise<Object>} Created notification document
 */
const createNotification = async (userId, title, message, type, relatedId = null, relatedModel = null) => {
  try {
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      relatedId,
      relatedModel,
    });
    return notification;
  } catch (error) {
    // Log but do not throw — notification failure should not break API flow
    console.error(`❌ Failed to create notification for user ${userId}: ${error.message}`);
    return null;
  }
};

/**
 * Notify patient of booking confirmation (awaiting doctor approval)
 */
const notifyBookingCreated = async (patientId, appointmentId, doctorName, date, startTime) => {
  return createNotification(
    patientId,
    'Appointment Requested',
    `Your appointment request with Dr. ${doctorName} on ${date} at ${startTime} has been submitted and is awaiting confirmation.`,
    'booking_confirmed',
    appointmentId,
    'Appointment'
  );
};

/**
 * Notify doctor of a new appointment request
 */
const notifyDoctorNewAppointment = async (doctorId, appointmentId, patientName, date, startTime) => {
  return createNotification(
    doctorId,
    'New Appointment Request',
    `${patientName} has requested an appointment on ${date} at ${startTime}. Please review and confirm.`,
    'booking_confirmed',
    appointmentId,
    'Appointment'
  );
};

/**
 * Notify patient that their appointment was confirmed by the doctor
 */
const notifyAppointmentConfirmed = async (patientId, appointmentId, doctorName, date, startTime) => {
  return createNotification(
    patientId,
    'Appointment Confirmed',
    `Dr. ${doctorName} has confirmed your appointment on ${date} at ${startTime}.`,
    'booking_confirmed',
    appointmentId,
    'Appointment'
  );
};

/**
 * Notify patient that their appointment was rejected by the doctor
 */
const notifyAppointmentRejected = async (patientId, appointmentId, doctorName, date, startTime) => {
  return createNotification(
    patientId,
    'Appointment Rejected',
    `Unfortunately, Dr. ${doctorName} has declined your appointment request for ${date} at ${startTime}. Please book another available slot.`,
    'appointment_rejected',
    appointmentId,
    'Appointment'
  );
};

/**
 * Notify both patient and doctor of a cancellation
 */
const notifyAppointmentCancelled = async (recipientId, appointmentId, cancelledByName, date, startTime) => {
  return createNotification(
    recipientId,
    'Appointment Cancelled',
    `The appointment scheduled for ${date} at ${startTime} has been cancelled by ${cancelledByName}.`,
    'appointment_cancelled',
    appointmentId,
    'Appointment'
  );
};

/**
 * Notify patient of appointment rescheduling
 */
const notifyAppointmentRescheduled = async (patientId, appointmentId, doctorName, newDate, newStartTime) => {
  return createNotification(
    patientId,
    'Appointment Rescheduled',
    `Your appointment with Dr. ${doctorName} has been rescheduled to ${newDate} at ${newStartTime}.`,
    'appointment_rescheduled',
    appointmentId,
    'Appointment'
  );
};

/**
 * Notify patient of appointment reminder
 */
const notifyAppointmentReminder = async (patientId, appointmentId, doctorName, date, startTime) => {
  return createNotification(
    patientId,
    'Appointment Tomorrow',
    `Reminder: You have an appointment with Dr. ${doctorName} tomorrow, ${date} at ${startTime}.`,
    'appointment_reminder',
    appointmentId,
    'Appointment'
  );
};

/**
 * Notify patient that appointment is completed
 */
const notifyAppointmentCompleted = async (patientId, appointmentId, doctorName) => {
  return createNotification(
    patientId,
    'Appointment Completed',
    `Your consultation with Dr. ${doctorName} has been marked as completed. Consultation notes and prescriptions are now available.`,
    'appointment_completed',
    appointmentId,
    'Appointment'
  );
};

/**
 * Notify patient that a prescription is ready
 */
const notifyPrescriptionReady = async (patientId, prescriptionId, doctorName) => {
  return createNotification(
    patientId,
    'Prescription Ready',
    `Dr. ${doctorName} has issued a new prescription for you. You can view it in your prescriptions section.`,
    'prescription_ready',
    prescriptionId,
    'Prescription'
  );
};

/**
 * Notify doctor that their account has been approved by admin
 */
const notifyDoctorApproved = async (doctorId) => {
  return createNotification(
    doctorId,
    'Account Approved',
    'Congratulations! Your doctor profile has been approved by the administrator. Patients can now book appointments with you. Please set your availability to get started.',
    'doctor_approved',
    null,
    null
  );
};

/**
 * Notify doctor that their account was rejected by admin
 */
const notifyDoctorRejected = async (doctorId, reason) => {
  return createNotification(
    doctorId,
    'Account Not Approved',
    `Your doctor profile application was not approved${reason ? ': ' + reason : '. Please contact support for more information.'}.`,
    'doctor_rejected',
    null,
    null
  );
};

module.exports = {
  createNotification,
  notifyBookingCreated,
  notifyDoctorNewAppointment,
  notifyAppointmentConfirmed,
  notifyAppointmentRejected,
  notifyAppointmentCancelled,
  notifyAppointmentRescheduled,
  notifyAppointmentReminder,
  notifyAppointmentCompleted,
  notifyPrescriptionReady,
  notifyDoctorApproved,
  notifyDoctorRejected,
};