const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// @route   GET api/notifications
// @desc    Get all notifications for a user
// @access  Private
router.get('/', auth, notificationController.getUserNotifications);

// @route   PUT api/notifications/:id
// @desc    Mark notification as read
// @access  Private
router.put('/:id', auth, notificationController.markAsRead);

// @route   PUT api/notifications/read/all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read/all', auth, notificationController.markAllAsRead);

// @route   DELETE api/notifications/all
// @desc    Delete all notifications for a user
// @access  Private
router.delete('/all', auth, notificationController.deleteAllNotifications);

module.exports = router; 