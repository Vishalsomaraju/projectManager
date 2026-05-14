const { prisma, redis } = require('../config/db');
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

    // Queue for email worker (Mocked for now)
    await redis.lpush('notifications:queue', JSON.stringify(notification));
    
    // Emit real-time event
    socketService.emitToUser(recipientId, 'notification:new', notification);
    
    // Invalidate count cache
    await redis.del(`notif:count:${recipientId}`);

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
    await redis.del(`notif:count:${userId}`);
    return prisma.notification.update({
      where: { id: notificationId, recipientId: userId },
      data: { read: true },
    });
  }

  async markAllRead(userId) {
    await redis.del(`notif:count:${userId}`);
    return prisma.notification.updateMany({
      where: { recipientId: userId, read: false },
      data: { read: true },
    });
  }

  async getUnreadCount(userId) {
    const cacheKey = `notif:count:${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached !== null) return parseInt(cached);

    const count = await prisma.notification.count({
      where: { recipientId: userId, read: false },
    });

    await redis.set(cacheKey, count, 'EX', 60);
    return count;
  }

  async deleteNotification(userId, id) {
    await redis.del(`notif:count:${userId}`);
    return prisma.notification.delete({
      where: { id, recipientId: userId },
    });
  }
}

module.exports = new NotificationsService();
