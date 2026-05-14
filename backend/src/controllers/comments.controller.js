const commentsService = require('../services/comments.service');

class CommentsController {
  async listComments(req, res) {
    try {
      const comments = await commentsService.listComments(req.params.taskId, req.user.id);
      res.json({ data: comments });
    } catch (error) {
      res.status(500).json({ error: { code: 'LIST_FAILED', message: error.message } });
    }
  }

  async createComment(req, res) {
    try {
      const comment = await commentsService.createComment(req.params.taskId, req.user.id, req.body.content);
      res.status(201).json({ data: comment });
    } catch (error) {
      res.status(400).json({ error: { code: 'CREATE_FAILED', message: error.message } });
    }
  }

  async updateComment(req, res) {
    try {
      const comment = await commentsService.updateComment(req.params.commentId, req.user.id, req.body.content);
      res.json({ data: comment });
    } catch (error) {
      res.status(400).json({ error: { code: 'UPDATE_FAILED', message: error.message } });
    }
  }

  async deleteComment(req, res) {
    try {
      await commentsService.deleteComment(req.params.commentId, req.user.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: { code: 'DELETE_FAILED', message: error.message } });
    }
  }

  async searchMembers(req, res) {
    try {
      const members = await commentsService.searchMembers(req.params.projectId, req.query.q);
      res.json({ data: members.map(m => m.user) });
    } catch (error) {
      res.status(500).json({ error: { code: 'SEARCH_FAILED', message: error.message } });
    }
  }
}

module.exports = new CommentsController();
