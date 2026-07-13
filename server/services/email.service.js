const { createTransporter } = require('../config/nodemailer');
const templates = require('../utils/emailTemplates');

/**
 * Core email sending function
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} html - HTML email body
 * @returns {Promise<boolean>} True if sent successfully, false otherwise
 */
const sendEmail = async (to, subject, html) => {
  // Skip sending if email credentials are not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`⚠️  Email not sent to ${to} — SMTP credentials not configured.`);
    return false;
  }

  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'MediBook <noreply@medibook.com>',
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    // Log the error but do not throw — email failure should not break API flow
    console.error(`❌ Email send failed to ${to}: ${error.message}`);
    return false;
  }
};

/**
 * Send welcome email to a newly registered user
 */
const sendWelcomeEmail = async (to, firstName, role) => {
  const subject = 'Welcome to MediBook — Your Account is Ready';
  const html = templates.welcomeEmail(firstName, role);
  return sendEmail(to, subject, html);
};

/**
 * Send booking confirmation to patient
 */
const sendBookingConfirmationEmail = async (to, patientName, doctorName, date, startTime, endTime, appointmentId) => {
  const subject = 'Appointment Booking Confirmation — MediBook';
  const html = templates.appointmentConfirmationEmail(patientName, doctorName, date, startTime, endTime, appointmentId);
  return sendEmail(to, subject, html);
};

/**
 * Send appointment confirmed by doctor email to patient
 */
const sendAppointmentConfirmedEmail = async (to, patientName, doctorName, date, startTime, endTime) => {
  const subject = 'Your Appointment Has Been Confirmed — MediBook';
  const html = templates.appointmentConfirmedByDoctorEmail(patientName, doctorName, date, startTime, endTime);
  return sendEmail(to, subject, html);
};

/**
 * Send appointment reminder email
 */
const sendAppointmentReminderEmail = async (to, patientName, doctorName, date, startTime, endTime) => {
  const subject = 'Appointment Reminder — Tomorrow — MediBook';
  const html = templates.appointmentReminderEmail(patientName, doctorName, date, startTime, endTime);
  return sendEmail(to, subject, html);
};

/**
 * Send cancellation email to the relevant party
 */
const sendCancellationEmail = async (to, recipientName, patientName, doctorName, date, startTime, cancelledBy, reason) => {
  const subject = 'Appointment Cancelled — MediBook';
  const html = templates.appointmentCancellationEmail(recipientName, patientName, doctorName, date, startTime, cancelledBy, reason);
  return sendEmail(to, subject, html);
};

/**
 * Send rescheduled appointment email
 */
const sendRescheduledEmail = async (to, recipientName, doctorName, oldDate, oldTime, newDate, newTime) => {
  const subject = 'Appointment Rescheduled — MediBook';
  const html = templates.appointmentRescheduledEmail(recipientName, doctorName, oldDate, oldTime, newDate, newTime);
  return sendEmail(to, subject, html);
};

/**
 * Send new appointment request notification to doctor
 */
const sendNewAppointmentToDoctorEmail = async (to, doctorName, patientName, date, startTime, endTime, reason) => {
  const subject = 'New Appointment Request — MediBook';
  const html = templates.newAppointmentForDoctorEmail(doctorName, patientName, date, startTime, endTime, reason);
  return sendEmail(to, subject, html);
};

/**
 * Send prescription ready notification to patient
 */
const sendPrescriptionReadyEmail = async (to, patientName, doctorName, date) => {
  const subject = 'Your Prescription is Ready — MediBook';
  const html = templates.prescriptionReadyEmail(patientName, doctorName, date);
  return sendEmail(to, subject, html);
};

/**
 * Send doctor account approval email
 */
const sendDoctorApprovedEmail = async (to, doctorName) => {
  const subject = 'Your Doctor Account Has Been Approved — MediBook';
  const html = templates.doctorApprovedEmail(doctorName);
  return sendEmail(to, subject, html);
};

/**
 * Send password changed confirmation email
 */
const sendPasswordChangedEmail = async (to, firstName) => {
  const subject = 'Password Changed Successfully — MediBook';
  const html = templates.passwordChangedEmail(firstName);
  return sendEmail(to, subject, html);
};

module.exports = {
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendAppointmentConfirmedEmail,
  sendAppointmentReminderEmail,
  sendCancellationEmail,
  sendRescheduledEmail,
  sendNewAppointmentToDoctorEmail,
  sendPrescriptionReadyEmail,
  sendDoctorApprovedEmail,
  sendPasswordChangedEmail,
};