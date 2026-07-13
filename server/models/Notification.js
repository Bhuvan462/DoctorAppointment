const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    type: {
      type: String,
      enum: {
        values: [
          'booking_confirmed',
          'appointment_reminder',
          'appointment_cancelled',
          'appointment_rescheduled',
          'appointment_rejected',
          'appointment_completed',
          'prescription_ready',
          'doctor_approved',
          'doctor_rejected',
          'general',
          'payment_received',
        ],
        message: 'Invalid notification type',
      },
      required: [true, 'Notification type is required'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    relatedModel: {
      type: String,
      enum: ['Appointment', 'ConsultationRecord', 'Prescription', 'User', 'Payment', null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast notification retrieval per user
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
