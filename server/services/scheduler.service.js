const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const emailService = require('./email.service');
const notificationService = require('./notification.service');

/**
 * Format a Date object to a readable string
 * @param {Date} date
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Send appointment reminders for appointments scheduled tomorrow
 * Runs every day at 8:00 AM server time
 */
const scheduleAppointmentReminders = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('🕐 Running appointment reminder cron job...');

    try {
      const now = new Date();

      // Define tomorrow's date range
      const tomorrowStart = new Date(now);
      tomorrowStart.setDate(now.getDate() + 1);
      tomorrowStart.setHours(0, 0, 0, 0);

      const tomorrowEnd = new Date(now);
      tomorrowEnd.setDate(now.getDate() + 1);
      tomorrowEnd.setHours(23, 59, 59, 999);

      // Find all confirmed appointments tomorrow that haven't had reminders sent
      const appointments = await Appointment.find({
        appointmentDate: {
          $gte: tomorrowStart,
          $lte: tomorrowEnd,
        },
        status: 'confirmed',
        reminderSent: false,
      })
        .populate('patientId', 'firstName lastName email')
        .populate('doctorId', 'firstName lastName email');

      console.log(`📋 Found ${appointments.length} appointment(s) requiring reminders.`);

      for (const appointment of appointments) {
        try {
          const patient = appointment.patientId;
          const doctor = appointment.doctorId;

          if (!patient || !doctor) {
            console.warn(`⚠️  Appointment ${appointment._id} has missing patient or doctor reference.`);
            continue;
          }

          const formattedDate = formatDate(appointment.appointmentDate);

          // Send in-app notification
          await notificationService.notifyAppointmentReminder(
            patient._id,
            appointment._id,
            `${doctor.firstName} ${doctor.lastName}`,
            formattedDate,
            appointment.startTime
          );

          // Send email notification
          await emailService.sendAppointmentReminderEmail(
            patient.email,
            `${patient.firstName} ${patient.lastName}`,
            `${doctor.firstName} ${doctor.lastName}`,
            formattedDate,
            appointment.startTime,
            appointment.endTime
          );

          // Mark reminder as sent to prevent duplicate reminders
          await Appointment.findByIdAndUpdate(appointment._id, { reminderSent: true });

          console.log(`✅ Reminder sent for appointment ${appointment._id} to ${patient.email}`);
        } catch (innerError) {
          console.error(`❌ Failed to send reminder for appointment ${appointment._id}: ${innerError.message}`);
        }
      }

      console.log('✅ Appointment reminder cron job completed.');
    } catch (error) {
      console.error(`❌ Appointment reminder cron job failed: ${error.message}`);
    }
  });

  console.log('✅ Appointment reminder scheduler registered (runs daily at 8:00 AM).');
};

/**
 * Auto-complete past confirmed appointments
 * Runs every hour to mark confirmed appointments whose end time has passed as completed
 */
const scheduleAutoComplete = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('🕐 Running auto-complete cron job...');

    try {
      const now = new Date();

      // Find confirmed appointments that are in the past
      const pastAppointments = await Appointment.find({
        status: 'confirmed',
        appointmentDate: { $lt: now },
      });

      let completedCount = 0;

      for (const appointment of pastAppointments) {
        // Parse appointment end time to check if it has fully passed
        const [endHour, endMin] = appointment.endTime.split(':').map(Number);
        const appointmentEndDateTime = new Date(appointment.appointmentDate);
        appointmentEndDateTime.setHours(endHour, endMin, 0, 0);

        if (now > appointmentEndDateTime) {
          await Appointment.findByIdAndUpdate(appointment._id, { status: 'completed' });
          completedCount++;
        }
      }

      if (completedCount > 0) {
        console.log(`✅ Auto-completed ${completedCount} past appointment(s).`);
      } else {
        console.log('✅ Auto-complete cron job: No appointments to complete.');
      }
    } catch (error) {
      console.error(`❌ Auto-complete cron job failed: ${error.message}`);
    }
  });

  console.log('✅ Auto-complete scheduler registered (runs every hour).');
};

/**
 * Initialize all scheduled jobs
 * Call this function once when the server starts
 */
const initializeSchedulers = () => {
  if (process.env.NODE_ENV !== 'test') {
    scheduleAppointmentReminders();
    scheduleAutoComplete();
    console.log('✅ All scheduled jobs initialized.');
  }
};

module.exports = { initializeSchedulers };