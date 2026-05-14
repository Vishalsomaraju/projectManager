const { prisma } = require('../index');

const rolesHierarchy = {
  VIEWER: 0,
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

const requireProjectAccess = (minRole = 'VIEWER') => async (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId, archivedAt: null },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found or archived' }
      });
    }

    const membership = project.members[0];

    if (!membership) {
      return res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'You are not a member of this project' }
      });
    }

    if (rolesHierarchy[membership.role] < rolesHierarchy[minRole]) {
      return res.status(403).json({
        error: { code: 'INSUFFICIENT_PERMISSIONS', message: `Minimum role required: ${minRole}` }
      });
    }

    req.project = project;
    req.membership = membership;
    next();
  } catch (error) {
    res.status(500).json({
      error: { code: 'INTERNAL_ERROR', message: error.message }
    });
  }
};

module.exports = {
  requireProjectAccess,
  rolesHierarchy,
};
