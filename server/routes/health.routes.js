const express = require('express');
const router = express.Router();
const {
  getMyHealthRecord,
  updateMyHealthInfo,
  getPatientHealthRecord,
  appendMedicalData
} = require('../controllers/health.controller');
const { protect } = require('../Middleware/auth.middleware');

// Routes for logged-in patient
router.get('/', protect, getMyHealthRecord);
router.put('/', protect, updateMyHealthInfo);

// Routes for doctors/admin to manage specific patient
router.get('/patient/:patientId', protect, getPatientHealthRecord);
router.post('/patient/:patientId/data', protect, appendMedicalData);

module.exports = router;
