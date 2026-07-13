const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { sendSuccess, sendError, buildPagination } = require('../utils/apiResponse');

/**
 * @desc    Get all notifications for the authenticated user
 * @route   GET /api/v1/notifications
 * @access  Private — any authenticated user
 */
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip  = (page - 1) * limit;

  const filter = { userId };

  // Optionally filter by read status
  if (req.query.isRead !== undefined) {
    filter.isRead = req.query.isRead === 'true';
  }

  const [notifications, totalCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
  ]);

  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  return sendSuccess(
    res,
    200,
    'Notifications retrieved successfully.',
    notifications,
    { ...buildPagination(page, limit, totalCount), unreadCount }
  );
});

/**
 * @desc    Mark a single notification as read
 * @route   PUT /api/v1/notifications/:id/read
 * @access  Private — owner only
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, 'Invalid notification ID.');
  }

  const notification = await Notification.findById(id);

  if (!notification) {
    return sendError(res, 404, 'Notification not found.');
  }

  if (String(notification.userId) !== String(req.user._id)) {
    return sendError(res, 403, 'Access denied.');
  }

  notification.isRead = true;
  await notification.save();

  return sendSuccess(res, 200, 'Notification marked as read.', notification);
});

/**
 * @desc    Mark all notifications as read for the authenticated user
 * @route   PUT /api/v1/notifications/read-all
 * @access  Private — any authenticated user
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  return sendSuccess(res, 200, 'All notifications marked as read.');
});

/**
 * @desc    Delete a single notification
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private — owner only
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendError(res, 400, 'Invalid notification ID.');
  }

  const notification = await Notification.findById(id);

  if (!notification) {
    return sendError(res, 404, 'Notification not found.');
  }

  if (String(notification.userId) !== String(req.user._id)) {
    return sendError(res, 403, 'Access denied.');
  }

  await notification.deleteOne();

  return sendSuccess(res, 200, 'Notification deleted successfully.');
});

/**
 * @desc    Delete all read notifications for the authenticated user
 * @route   DELETE /api/v1/notifications/read
 * @access  Private — any authenticated user
 */
const deleteReadNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ userId: req.user._id, isRead: true });

  return sendSuccess(res, 200, 'All read notifications deleted.');
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
};
