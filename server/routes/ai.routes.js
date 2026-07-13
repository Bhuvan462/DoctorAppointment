const express = require("express");
const router = express.Router();
const { triageSymptoms } = require("../controllers/ai.controller");
const { protect } = require("../Middleware/auth.middleware");

// @route   POST /api/v1/ai/triage
// @desc    Analyze symptoms and get triage recommendations
// @access  Public (or Patient, based on auth needs. Let's make it public/patient optional so anyone can try)
router.post("/triage", triageSymptoms);

module.exports = router;
