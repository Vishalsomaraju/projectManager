const { prisma } = require('../config/db');
const { socketService } = require('../socket/index');

class TasksService {
  async listTasks(projectId, filters = {}) {
    const { assigneeId, priority, labelIds, search, dueBefore } = filters;

    const where = {
      projectId,
      ...(assigneeId && { assigneeId }),
      ...(priority && { priority }),
      ...(search && { title: { contains: search, mode: 'insensitive' } }),
      ...(dueBefore && { dueDate: { lte: new Date(dueBefore) } }),
      ...(labelIds && labelIds.length > 0 && {
        labels: {
          some: {
            labelId: { in: labelIds }
          }
        }
      }),
    };

    return prisma.task.findMany({
      where,
      orderBy: [{ columnId: 'asc' }, { order: 'asc' }],
      include: {
        assignee: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        _count: { select: { comments: true } },
        labels: { include: { label: true } },
      },
    });
  }

  async listColumnTasks(columnId) {
    return prisma.task.findMany({
      where: { columnId },
      orderBy: { order: 'asc' },
      include: {
        assignee: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        _count: { select: { comments: true } },
        labels: { include: { label: true } },
      },
    });
  }

  async createTask(projectId, columnId, data) {
    const lastTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' },
    });

    const nextOrder = lastTask ? lastTask.order + 1 : 0;

    const task = await prisma.task.create({
      data: {
        ...data,
        order: nextOrder,
        projectId,
        columnId,
      },
      include: {
        assignee: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        labels: { include: { label: true } },
      },
    });

    // Emit socket event
    socketService.emitToProject(projectId, 'task:created', task);

    return task;
  }

  async getTask(taskId) {
    return prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
        column: true,
        assignee: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { id: true, displayName: true, avatarUrl: true } } }
        },
        labels: { include: { label: true } },
        attachments: true,
        watchers: { include: { user: { select: { id: true, displayName: true, avatarUrl: true } } } },
      },
    });
  }

  async updateTask(taskId, data) {
    const task = await prisma.task.update({
      where: { id: taskId },
      data,
      include: {
        assignee: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        labels: { include: { label: true } },
      },
    });

    // Emit socket event
    socketService.emitToProject(task.projectId, 'task:updated', task);
    socketService.emitToTask(taskId, 'task:updated', task);

    return task;
  }

  async deleteTask(taskId) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (task) {
      await prisma.task.delete({ where: { id: taskId } });
      socketService.emitToProject(task.projectId, 'task:deleted', { taskId });
    }
    return task;
  }

  async moveTask(taskId, { columnId, order }) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error('Task not found');

    const sourceColumnId = task.columnId;

    // Update orders in target column
    await prisma.task.updateMany({
      where: { columnId, order: { gte: order } },
      data: { order: { increment: 1 } },
    });

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { columnId, order },
    });

    socketService.emitToProject(task.projectId, 'task:moved', {
      taskId,
      fromColumnId: sourceColumnId,
      toColumnId: columnId,
      order,
    });

    // Reorder source column to close gap
    await prisma.task.updateMany({
      where: { columnId: sourceColumnId, order: { gt: task.order } },
      data: { order: { decrement: 1 } },
    });

    return updatedTask;
  }

  async reorderTasks(columnId, tasks) {
    // tasks: [{ id, order }]
    const updates = tasks.map(({ id, order }) =>
      prisma.task.update({
        where: { id },
        data: { order },
      })
    );

    return prisma.$transaction(updates);
  }

  async addLabel(taskId, labelId) {
    return prisma.taskLabel.create({
      data: { taskId, labelId },
    });
  }

  async removeLabel(taskId, labelId) {
    return prisma.taskLabel.delete({
      where: { taskId_labelId: { taskId, labelId } },
    });
  }

  async toggleWatch(taskId, userId, watch) {
    if (watch) {
      return prisma.taskWatcher.create({ data: { taskId, userId } });
    } else {
      return prisma.taskWatcher.delete({ where: { userId_taskId: { userId, taskId } } });
    }
  }
}

module.exports = new TasksService();
