const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const emailService = require('./email.service');
const notificationService = require('./notification.service');

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const runAppointmentReminders = async () => {
  console.log('🕐 Running appointment reminder task...');
  try {
    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(now.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(now);
    tomorrowEnd.setDate(now.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);

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

        await notificationService.notifyAppointmentReminder(
          patient._id,
          appointment._id,
          `${doctor.firstName} ${doctor.lastName}`,
          formattedDate,
          appointment.startTime
        );

        await emailService.sendAppointmentReminderEmail(
          patient.email,
          `${patient.firstName} ${patient.lastName}`,
          `${doctor.firstName} ${doctor.lastName}`,
          formattedDate,
          appointment.startTime,
          appointment.endTime
        );

        await Appointment.findByIdAndUpdate(appointment._id, { reminderSent: true });

        console.log(`✅ Reminder sent for appointment ${appointment._id} to ${patient.email}`);
      } catch (innerError) {
        console.error(`❌ Failed to send reminder for appointment ${appointment._id}: ${innerError.message}`);
      }
    }
    console.log('✅ Appointment reminder task completed.');
  } catch (error) {
    console.error(`❌ Appointment reminder task failed: ${error.message}`);
  }
};

const runAutoComplete = async () => {
  console.log('🕐 Running auto-complete task...');
  try {
    const now = new Date();
    const pastAppointments = await Appointment.find({
      status: 'confirmed',
      appointmentDate: { $lt: now },
    });

    let completedCount = 0;

    for (const appointment of pastAppointments) {
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
      console.log('✅ Auto-complete task: No appointments to complete.');
    }
  } catch (error) {
    console.error(`❌ Auto-complete task failed: ${error.message}`);
  }
};

const scheduleAppointmentReminders = () => {
  cron.schedule('0 8 * * *', runAppointmentReminders);
  console.log('✅ Appointment reminder scheduler registered (runs daily at 8:00 AM).');
};

const scheduleAutoComplete = () => {
  cron.schedule('0 * * * *', runAutoComplete);
  console.log('✅ Auto-complete scheduler registered (runs every hour).');
};

const initializeSchedulers = () => {
  // We disable node-cron in Vercel. We only enable it if NOT on Vercel.
  if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    scheduleAppointmentReminders();
    scheduleAutoComplete();
    console.log('✅ All scheduled jobs initialized.');
  }
};

module.exports = { initializeSchedulers, runAppointmentReminders, runAutoComplete };