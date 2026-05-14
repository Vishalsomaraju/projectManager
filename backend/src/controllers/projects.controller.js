const projectsService = require('../services/projects.service');

class ProjectsController {
  async listProjects(req, res) {
    try {
      const projects = await projectsService.listProjects(req.user.id);
      res.json({ data: projects });
    } catch (error) {
      res.status(500).json({ error: { code: 'LIST_FAILED', message: error.message } });
    }
  }

  async createProject(req, res) {
    try {
      const project = await projectsService.createProject(req.user.id, req.body);
      res.status(201).json({ data: project });
    } catch (error) {
      res.status(400).json({ error: { code: 'CREATE_FAILED', message: error.message } });
    }
  }

  async getProject(req, res) {
    try {
      const project = await projectsService.getProject(req.params.projectId);
      res.json({ data: project });
    } catch (error) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: error.message } });
    }
  }

  async updateProject(req, res) {
    try {
      const project = await projectsService.updateProject(req.params.projectId, req.body);
      res.json({ data: project });
    } catch (error) {
      res.status(400).json({ error: { code: 'UPDATE_FAILED', message: error.message } });
    }
  }

  async archiveProject(req, res) {
    try {
      await projectsService.archiveProject(req.params.projectId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: { code: 'ARCHIVE_FAILED', message: error.message } });
    }
  }

  async listMembers(req, res) {
    try {
      const members = await projectsService.listMembers(req.params.projectId);
      res.json({ data: members });
    } catch (error) {
      res.status(500).json({ error: { code: 'MEMBERS_FAILED', message: error.message } });
    }
  }

  async inviteMember(req, res) {
    try {
      const { email, role } = req.body;
      const invite = await projectsService.createInvite(req.params.projectId, email, role || 'MEMBER');
      res.status(201).json({ data: invite });
    } catch (error) {
      res.status(400).json({ error: { code: 'INVITE_FAILED', message: error.message } });
    }
  }

  async updateMemberRole(req, res) {
    try {
      const { role } = req.body;
      const member = await projectsService.updateMemberRole(req.params.projectId, req.params.uid, role);
      res.json({ data: member });
    } catch (error) {
      res.status(400).json({ error: { code: 'UPDATE_ROLE_FAILED', message: error.message } });
    }
  }

  async removeMember(req, res) {
    try {
      await projectsService.removeMember(req.params.projectId, req.params.uid);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: { code: 'REMOVE_MEMBER_FAILED', message: error.message } });
    }
  }

  async joinProject(req, res) {
    try {
      const { token } = req.params;
      const membership = await projectsService.joinProject(req.user.id, token);
      res.json({ data: membership });
    } catch (error) {
      res.status(400).json({ error: { code: 'JOIN_FAILED', message: error.message } });
    }
  }
}

module.exports = new ProjectsController();
