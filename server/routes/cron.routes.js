const express = require('express');
const router = express.Router();
const { runAppointmentReminders, runAutoComplete } = require('../services/scheduler.service');

// Vercel Cron routes - we can secure them using a secret token if needed,
// Vercel sends a CRON_SECRET header that we can verify.
const verifyCronSecret = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

router.get('/reminders', verifyCronSecret, async (req, res) => {
    try {
        await runAppointmentReminders();
        res.status(200).json({ success: true, message: 'Reminders job executed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/autocomplete', verifyCronSecret, async (req, res) => {
    try {
        await runAutoComplete();
        res.status(200).json({ success: true, message: 'Autocomplete job executed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
