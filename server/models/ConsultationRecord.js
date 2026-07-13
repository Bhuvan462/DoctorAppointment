const mongoose = require('mongoose');

const consultationRecordSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: [true, 'Appointment ID is required'],
      unique: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor ID is required'],
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient ID is required'],
    },
    symptoms: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 20;
        },
        message: 'Cannot list more than 20 symptoms',
      },
    },
    diagnosis: {
      type: String,
      trim: true,
      maxlength: [2000, 'Diagnosis cannot exceed 2000 characters'],
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [5000, 'Notes cannot exceed 5000 characters'],
      default: '',
    },
    vitalSigns: {
      bloodPressure: {
        type: String,
        trim: true,
        default: '',
      },
      heartRate: {
        type: String,
        trim: true,
        default: '',
      },
      temperature: {
        type: String,
        trim: true,
        default: '',
      },
      weight: {
        type: String,
        trim: true,
        default: '',
      },
      height: {
        type: String,
        trim: true,
        default: '',
      },
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    followUpNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Follow-up notes cannot exceed 1000 characters'],
      default: '',
    },
    attachments: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: 'Cannot attach more than 10 files',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
// consultationRecordSchema.index({ appointmentId: 1 }, { unique: true });
consultationRecordSchema.index({ patientId: 1, createdAt: -1 });
consultationRecordSchema.index({ doctorId: 1, createdAt: -1 });

const ConsultationRecord = mongoose.model('ConsultationRecord', consultationRecordSchema);

module.exports = ConsultationRecord;
