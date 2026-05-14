const notificationsService = require('../services/notifications.service');

exports.getNotifications = async (req, res, next) => {
  try {
    const data = await notificationsService.getNotifications(req.user.id, req.query);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationsService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    next(error);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    await notificationsService.markRead(req.user.id, req.params.id);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await notificationsService.markAllRead(req.user.id);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    await notificationsService.deleteNotification(req.user.id, req.params.id);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
