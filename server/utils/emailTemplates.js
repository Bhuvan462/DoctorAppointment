/**
 * HTML Email Templates
 * Used by the email service to send formatted notification emails
 */

/**
 * Base email wrapper with branding
 * @param {string} content - Inner HTML content
 * @returns {string} Complete HTML email
 */
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Doctor Appointment System</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f9; color: #333; }
    .wrapper { max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { color: #bfdbfe; font-size: 14px; margin-top: 5px; }
    .body { padding: 35px 40px; }
    .body h2 { color: #1e40af; font-size: 20px; margin-bottom: 15px; }
    .body p { color: #555; font-size: 15px; line-height: 1.7; margin-bottom: 12px; }
    .info-box { background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 6px; padding: 18px 20px; margin: 20px 0; }
    .info-box p { margin: 5px 0; color: #1e3a8a; font-size: 14px; }
    .info-box strong { color: #1e40af; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 15px; font-weight: 600; margin-top: 10px; }
    .status-badge { display: inline-block; padding: 5px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; margin: 10px 0; }
    .status-confirmed { background-color: #d1fae5; color: #065f46; }
    .status-cancelled { background-color: #fee2e2; color: #991b1b; }
    .status-pending { background-color: #fef3c7; color: #92400e; }
    .status-rescheduled { background-color: #e0e7ff; color: #3730a3; }
    .footer { background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { color: #94a3b8; font-size: 12px; line-height: 1.6; }
    .divider { height: 1px; background-color: #e2e8f0; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🏥 MediBook</h1>
      <p>Doctor Appointment System</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>This is an automated message from MediBook. Please do not reply to this email.</p>
      <p style="margin-top: 5px;">© ${new Date().getFullYear()} MediBook. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Welcome email for newly registered users
 */
const welcomeEmail = (firstName, role) => baseTemplate(`
  <h2>Welcome to MediBook, ${firstName}! 👋</h2>
  <p>Your account has been successfully created as a <strong>${role}</strong>.</p>
  <p>You can now log in to your account and start using the platform.</p>
  ${role === 'doctor' ? '<p>Please note that your doctor profile needs to be approved by an administrator before patients can book appointments with you.</p>' : ''}
  <p>If you have any questions, feel free to reach out to our support team.</p>
`);

/**
 * Appointment booking confirmation email
 */
const appointmentConfirmationEmail = (patientName, doctorName, date, startTime, endTime, appointmentId) => baseTemplate(`
  <h2>Appointment Booked Successfully ✅</h2>
  <p>Dear ${patientName},</p>
  <p>Your appointment has been successfully requested. Here are the details:</p>
  <div class="info-box">
    <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
    <p><strong>Appointment ID:</strong> ${appointmentId}</p>
    <p><strong>Status:</strong> <span class="status-badge status-pending">Pending Confirmation</span></p>
  </div>
  <p>Your appointment is awaiting confirmation from the doctor. You will receive another notification once it is confirmed.</p>
  <p>Please arrive 10 minutes before your scheduled appointment time.</p>
`);

/**
 * Appointment confirmed by doctor email
 */
const appointmentConfirmedByDoctorEmail = (patientName, doctorName, date, startTime, endTime) => baseTemplate(`
  <h2>Appointment Confirmed 🎉</h2>
  <p>Dear ${patientName},</p>
  <p>Great news! Dr. ${doctorName} has confirmed your appointment.</p>
  <div class="info-box">
    <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
    <p><strong>Status:</strong> <span class="status-badge status-confirmed">Confirmed</span></p>
  </div>
  <p>Please make sure to arrive on time. If you need to cancel or reschedule, please do so at least 24 hours in advance.</p>
`);

/**
 * Appointment reminder email (sent before appointment)
 */
const appointmentReminderEmail = (patientName, doctorName, date, startTime, endTime) => baseTemplate(`
  <h2>Appointment Reminder ⏰</h2>
  <p>Dear ${patientName},</p>
  <p>This is a friendly reminder that you have an upcoming appointment tomorrow.</p>
  <div class="info-box">
    <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
  </div>
  <p>Please ensure you arrive at least 10 minutes before your appointment time.</p>
  <p>If you need to cancel, please do so as soon as possible to allow other patients to book the slot.</p>
`);

/**
 * Appointment cancellation email
 */
const appointmentCancellationEmail = (recipientName, patientName, doctorName, date, startTime, cancelledBy, reason) => baseTemplate(`
  <h2>Appointment Cancelled ❌</h2>
  <p>Dear ${recipientName},</p>
  <p>An appointment has been cancelled. Here are the details:</p>
  <div class="info-box">
    <p><strong>Patient:</strong> ${patientName}</p>
    <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Time:</strong> ${startTime}</p>
    <p><strong>Cancelled by:</strong> ${cancelledBy}</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p><strong>Status:</strong> <span class="status-badge status-cancelled">Cancelled</span></p>
  </div>
  <p>If this cancellation was unexpected, please contact support or book a new appointment.</p>
`);

/**
 * Appointment rescheduled email
 */
const appointmentRescheduledEmail = (recipientName, doctorName, oldDate, oldTime, newDate, newTime) => baseTemplate(`
  <h2>Appointment Rescheduled 📅</h2>
  <p>Dear ${recipientName},</p>
  <p>Your appointment with Dr. ${doctorName} has been rescheduled.</p>
  <div class="info-box">
    <p><strong>Previous Date:</strong> ${oldDate} at ${oldTime}</p>
    <p><strong>New Date:</strong> ${newDate} at ${newTime}</p>
    <p><strong>Status:</strong> <span class="status-badge status-rescheduled">Rescheduled</span></p>
  </div>
  <p>Please note the new appointment date and time. If this change is not convenient, you may cancel and book a new appointment.</p>
`);

/**
 * New appointment notification for doctor
 */
const newAppointmentForDoctorEmail = (doctorName, patientName, date, startTime, endTime, reason) => baseTemplate(`
  <h2>New Appointment Request 📋</h2>
  <p>Dear Dr. ${doctorName},</p>
  <p>You have received a new appointment request from a patient.</p>
  <div class="info-box">
    <p><strong>Patient:</strong> ${patientName}</p>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Time:</strong> ${startTime} - ${endTime}</p>
    ${reason ? `<p><strong>Reason for Visit:</strong> ${reason}</p>` : ''}
    <p><strong>Status:</strong> <span class="status-badge status-pending">Awaiting Your Confirmation</span></p>
  </div>
  <p>Please log in to your dashboard to confirm or reject this appointment request.</p>
`);

/**
 * Prescription ready email
 */
const prescriptionReadyEmail = (patientName, doctorName, date) => baseTemplate(`
  <h2>Your Prescription is Ready 💊</h2>
  <p>Dear ${patientName},</p>
  <p>Dr. ${doctorName} has issued a prescription following your consultation on ${date}.</p>
  <p>You can view and download your prescription by logging into your account.</p>
  <div class="info-box">
    <p><strong>Doctor:</strong> Dr. ${doctorName}</p>
    <p><strong>Consultation Date:</strong> ${date}</p>
  </div>
  <p>Please follow the prescribed medication instructions carefully. Contact your doctor if you have any concerns.</p>
`);

/**
 * Doctor account approved email
 */
const doctorApprovedEmail = (doctorName) => baseTemplate(`
  <h2>Account Approved 🎉</h2>
  <p>Dear Dr. ${doctorName},</p>
  <p>Congratulations! Your doctor profile has been reviewed and approved by our administration team.</p>
  <p>Your profile is now visible to patients, and they can book appointments with you.</p>
  <p>Please log in to your dashboard to:</p>
  <ul style="margin: 10px 0 10px 20px; color: #555; line-height: 1.8;">
    <li>Set your availability schedule</li>
    <li>Complete your profile information</li>
    <li>Start receiving appointment requests</li>
  </ul>
  <p>Welcome to the MediBook family!</p>
`);

/**
 * Password change confirmation email
 */
const passwordChangedEmail = (firstName) => baseTemplate(`
  <h2>Password Changed Successfully 🔐</h2>
  <p>Dear ${firstName},</p>
  <p>Your password has been successfully changed.</p>
  <p>If you did not make this change, please contact our support team immediately as your account may have been compromised.</p>
  <div class="info-box">
    <p><strong>Time of Change:</strong> ${new Date().toLocaleString()}</p>
  </div>
`);

module.exports = {
  welcomeEmail,
  appointmentConfirmationEmail,
  appointmentConfirmedByDoctorEmail,
  appointmentReminderEmail,
  appointmentCancellationEmail,
  appointmentRescheduledEmail,
  newAppointmentForDoctorEmail,
  prescriptionReadyEmail,
  doctorApprovedEmail,
  passwordChangedEmail,
};