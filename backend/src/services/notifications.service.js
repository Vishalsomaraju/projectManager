const { prisma } = require('../config/db');
const { socketService } = require('../socket/index');

class NotificationsService {
  async createNotification({ type, recipientId, actorId, payload }) {
    const notification = await prisma.notification.create({
      data: {
        type,
        recipientId,
        actorId,
        payload,
      },
      include: {
        actor: { select: { id: true, displayName: true, avatarUrl: true } }
      }
    });

    // Email worker queue removed (Postgres-only)
    // For now, we just emit the real-time event. 
    // In a real app, you might want to trigger emails asynchronously in a separate process.
    console.log(`[NOTIFICATION] Queueing notification for recipient ${recipientId} via socket.`);
    
    // Emit real-time event
    socketService.emitToUser(recipientId, 'notification:new', notification);
    
    return notification;
  }

  async getNotifications(userId, { unreadOnly = false, page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;
    const where = {
      recipientId: userId,
      ...(unreadOnly === 'true' && { read: false }),
    };

    const [notifications, total, unread] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: {
          actor: { select: { id: true, displayName: true, avatarUrl: true } }
        }
      }),
      prisma.notification.count({ where: { recipientId: userId } }),
      prisma.notification.count({ where: { recipientId: userId, read: false } }),
    ]);

    return {
      notifications,
      meta: {
        total,
        unread,
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: total > skip + notifications.length
      }
    };
  }

  async markRead(userId, notificationId) {
    return prisma.notification.update({
      where: { id: notificationId, recipientId: userId },
      data: { read: true },
    });
  }

  async markAllRead(userId) {
    return prisma.notification.updateMany({
      where: { recipientId: userId, read: false },
      data: { read: true },
    });
  }

  async getUnreadCount(userId) {
    // Caching removed (Postgres-only)
    return prisma.notification.count({
      where: { recipientId: userId, read: false },
    });
  }

  async deleteNotification(userId, id) {
    return prisma.notification.delete({
      where: { id, recipientId: userId },
    });
  }
}

module.exports = new NotificationsService();
