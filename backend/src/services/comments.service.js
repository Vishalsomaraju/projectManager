const { prisma } = require('../config/db');
const { socketService } = require('../socket/index');

class CommentsService {
  async listComments(taskId, userId) {
    const comments = await prisma.comment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { id: true, displayName: true, avatarUrl: true }
        }
      }
    });

    return comments.map(comment => ({
      ...comment,
      isEdited: comment.updatedAt > comment.createdAt,
      canEdit: comment.authorId === userId && (Date.now() - comment.createdAt.getTime()) < 15 * 60 * 1000,
    }));
  }

  async createComment(taskId, authorId, content) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true }
    });

    if (!task) throw new Error('Task not found');

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        authorId,
      },
      include: {
        author: {
          select: { id: true, displayName: true, avatarUrl: true }
        }
      }
    });

    // Parse mentions
    const mentions = this.parseMentions(content);
    if (mentions.length > 0) {
      const mentionedUsers = await prisma.projectMember.findMany({
        where: {
          projectId: task.projectId,
          user: { username: { in: mentions } }
        },
        select: { userId: true }
      });

      const notificationData = mentionedUsers.map(member => ({
        type: 'MENTIONED',
        recipientId: member.userId,
        actorId: authorId,
        payload: {
          taskId,
          commentId: comment.id,
          preview: content.slice(0, 100)
        }
      }));

      await prisma.notification.createMany({ data: notificationData });
      
      // Emit notifications
      notificationData.forEach(notif => {
        socketService.emitToUser(notif.recipientId, 'notification:new', notif);
      });
    }

    // Notify task watchers
    const watchers = await prisma.taskWatcher.findMany({
      where: { taskId, NOT: { userId: authorId } },
      select: { userId: true }
    });

    if (watchers.length > 0) {
      const watcherNotifications = watchers.map(w => ({
        type: 'COMMENT_ADDED',
        recipientId: w.userId,
        actorId: authorId,
        payload: { taskId, commentId: comment.id }
      }));
      await prisma.notification.createMany({ data: watcherNotifications });
      
      // Emit notifications
      watcherNotifications.forEach(notif => {
        socketService.emitToUser(notif.recipientId, 'notification:new', notif);
      });
    }

    // Emit socket event
    socketService.emitToTask(taskId, 'comment:added', { comment, taskId });

    return comment;
  }

  async updateComment(commentId, userId, content) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new Error('Comment not found');
    if (comment.authorId !== userId) throw new Error('Unauthorized');
    if ((Date.now() - comment.createdAt.getTime()) > 15 * 60 * 1000) {
      throw new Error('Comments can only be edited within 15 minutes');
    }

    return prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });
  }

  async deleteComment(commentId, userId) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new Error('Comment not found');
    if (comment.authorId !== userId) throw new Error('Unauthorized');

    return prisma.comment.update({
      where: { id: commentId },
      data: {
        content: '[deleted]',
        deletedAt: new Date(),
      },
    });
  }

  parseMentions(content) {
    const mentionRegex = /@(\w+)/g;
    const matches = content.matchAll(mentionRegex);
    return Array.from(matches, m => m[1]);
  }

  async searchMembers(projectId, query) {
    return prisma.projectMember.findMany({
      where: {
        projectId,
        user: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { displayName: { contains: query, mode: 'insensitive' } },
          ],
        },
      },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatarUrl: true }
        }
      },
      limit: 5,
    });
  }
}

module.exports = new CommentsService();
