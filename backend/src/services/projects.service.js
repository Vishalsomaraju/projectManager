const { prisma } = require('../config/db');
const crypto = require('crypto');

class ProjectsService {
  async listProjects(userId) {
    const memberships = await prisma.projectMember.findMany({
      where: { userId, project: { archivedAt: null } },
      include: {
        project: {
          include: {
            _count: {
              select: {
                members: true,
                tasks: { where: { completedAt: null } },
              },
            },
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.project,
      myRole: m.role,
      memberCount: m.project._count.members,
      openTaskCount: m.project._count.tasks,
      _count: undefined,
    }));
  }

  async createProject(userId, data) {
    const { title, description, color, icon } = data;
    const slug = `${title.toLowerCase().replace(/ /g, '-')}-${crypto.randomBytes(3).toString('hex')}`;

    return prisma.project.create({
      data: {
        title,
        description,
        color,
        icon,
        slug,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
        // Default columns
        columns: {
          create: [
            { name: 'Backlog', order: 0, color: '#64748B' },
            { name: 'In Progress', order: 1, color: '#3B82F6' },
            { name: 'Done', order: 2, color: '#10B981' },
          ],
        },
      },
    });
  }

  async getProject(projectId) {
    return prisma.project.findUnique({
      where: { id: projectId },
      include: {
        columns: {
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { tasks: true } },
          },
        },
        _count: { select: { members: true } },
      },
    });
  }

  async updateProject(projectId, data) {
    return prisma.project.update({
      where: { id: projectId },
      data,
    });
  }

  async archiveProject(projectId) {
    return prisma.project.update({
      where: { id: projectId },
      data: { archivedAt: new Date() },
    });
  }

  async listMembers(projectId) {
    return prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            email: true,
          },
        },
      },
    });
  }

  async createInvite(projectId, email, role) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    const invite = await prisma.projectInvite.create({
      data: {
        projectId,
        email,
        token,
        role,
        expiresAt,
      },
    });

    // Mock email sending
    console.log(`[INVITE] To: ${email}, Token: ${token}, Link: /projects/join/${token}`);
    
    return invite;
  }

  async joinProject(userId, token) {
    const invite = await prisma.projectInvite.findUnique({
      where: { token },
    });

    if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
      throw new Error('Invalid or expired invite token');
    }

    const membership = await prisma.projectMember.create({
      data: {
        userId,
        projectId: invite.projectId,
        role: invite.role,
      },
    });

    await prisma.projectInvite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    });

    return membership;
  }

  async updateMemberRole(projectId, userId, role) {
    return prisma.projectMember.update({
      where: { userId_projectId: { userId, projectId } },
      data: { role },
    });
  }

  async removeMember(projectId, userId) {
    return prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId } },
    });
  }
}

module.exports = new ProjectsService();
