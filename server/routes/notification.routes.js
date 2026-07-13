const express = require('express');
const router = express.Router();
const { protect } = require('../Middleware/auth.middleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
} = require('../controllers/notification.controller');

// All notification routes require authentication
router.use(protect);

/**
 * @route   GET /api/v1/notifications
 * @desc    Get all notifications for the authenticated user
 * @access  Private
 */
router.get('/', getNotifications);

/**
 * @route   PUT /api/v1/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', markAllAsRead);

/**
 * @route   DELETE /api/v1/notifications/read
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete('/read', deleteReadNotifications);

/**
 * @route   PUT /api/v1/notifications/:id/read
 * @desc    Mark a single notification as read
 * @access  Private
 */
router.put('/:id/read', markAsRead);

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete a single notification
 * @access  Private
 */
router.delete('/:id', deleteNotification);

module.exports = router;
