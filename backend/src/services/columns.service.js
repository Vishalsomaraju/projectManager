const { prisma } = require('../index');

class ColumnsService {
  async listColumns(projectId) {
    return prisma.column.findMany({
      where: { projectId },
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { tasks: true } },
      },
    });
  }

  async createColumn(projectId, { name, color }) {
    const lastColumn = await prisma.column.findFirst({
      where: { projectId },
      orderBy: { order: 'desc' },
    });

    const nextOrder = lastColumn ? lastColumn.order + 1 : 0;

    return prisma.column.create({
      data: {
        name,
        color,
        order: nextOrder,
        projectId,
      },
    });
  }

  async updateColumn(columnId, data) {
    return prisma.column.update({
      where: { id: columnId },
      data,
    });
  }

  async deleteColumn(columnId) {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: { tasks: true },
    });

    if (!column) throw new Error('Column not found');

    if (column.tasks.length > 0) {
      // Find another column to move tasks to
      const targetColumn = await prisma.column.findFirst({
        where: { projectId: column.projectId, NOT: { id: columnId } },
        orderBy: { order: 'asc' },
      });

      if (targetColumn) {
        await prisma.task.updateMany({
          where: { columnId },
          data: { columnId: targetColumn.id },
        });
      } else {
        throw new Error('Cannot delete last column with tasks. Create another column first.');
      }
    }

    return prisma.column.delete({ where: { id: columnId } });
  }

  async reorderColumns(projectId, columns) {
    // columns: [{ id, order }]
    const updates = columns.map(({ id, order }) =>
      prisma.column.update({
        where: { id },
        data: { order },
      })
    );

    return prisma.$transaction(updates);
  }
}

module.exports = new ColumnsService();
