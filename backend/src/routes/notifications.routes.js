const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications.controller');
const passport = require('passport');

// All notification routes require authentication
router.use(passport.authenticate('jwt', { session: false }));

router.get('/', notificationsController.getNotifications);
router.get('/unread-count', notificationsController.getUnreadCount);
router.patch('/mark-all-read', notificationsController.markAllRead);
router.patch('/:id/read', notificationsController.markRead);
router.delete('/:id', notificationsController.deleteNotification);

module.exports = router;
