const mongoose = require('mongoose');

const vitalReadingSchema = new mongoose.Schema({
  value: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { _id: false });

const medicalNoteSchema = new mongoose.Schema({
  note: { type: String, required: true },
  date: { type: Date, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { _id: false });

const healthRecordSchema = new mongoose.Schema({
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  
  // Patient Information
  bloodGroup: { type: String, default: '' },
  height: { type: Number, default: 0 }, // in cm
  weight: { type: Number, default: 0 }, // in kg
  allergies: [{ type: String }],
  currentMedications: [{ type: String }],
  chronicDiseases: [{ type: String }],
  emergencyContact: {
    name: { type: String, default: '' },
    relationship: { type: String, default: '' },
    phone: { type: String, default: '' }
  },
  lifestyleInfo: { type: String, default: '' },

  // Doctor Information
  lastConsultationDate: { type: Date, default: null },
  treatingDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  medicalNotes: [medicalNoteSchema],
  diagnoses: [medicalNoteSchema],
  treatmentHistory: [medicalNoteSchema],

  // Vitals History
  vitals: {
    bloodPressure: [vitalReadingSchema],
    bloodSugar: [vitalReadingSchema],
    heartRate: [vitalReadingSchema],
    oxygenSaturation: [vitalReadingSchema],
    bodyTemperature: [vitalReadingSchema]
  }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Auto calculate BMI based on height and weight
healthRecordSchema.virtual('bmi').get(function() {
  if (this.height > 0 && this.weight > 0) {
    const heightInMeters = this.height / 100;
    return (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  return 0;
});

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
