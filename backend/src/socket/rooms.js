const { prisma } = require('../index');

const getProjectRoom = (projectId) => `project:${projectId}`;
const getTaskRoom = (taskId) => `task:${taskId}`;
const getUserRoom = (userId) => `user:${userId}`;

const canAccessProject = async (userId, projectId) => {
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  return !!membership;
};

const canAccessTask = async (userId, taskId) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true },
  });
  if (!task) return false;
  return canAccessProject(userId, task.projectId);
};

module.exports = {
  getProjectRoom,
  getTaskRoom,
  getUserRoom,
  canAccessProject,
  canAccessTask,
};
