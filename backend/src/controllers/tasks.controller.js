const tasksService = require('../services/tasks.service');

class TasksController {
  async listTasks(req, res) {
    try {
      const tasks = await tasksService.listTasks(req.params.projectId, req.query);
      res.json({ data: tasks });
    } catch (error) {
      res.status(500).json({ error: { code: 'LIST_FAILED', message: error.message } });
    }
  }

  async listColumnTasks(req, res) {
    try {
      const tasks = await tasksService.listColumnTasks(req.params.cid);
      res.json({ data: tasks });
    } catch (error) {
      res.status(500).json({ error: { code: 'LIST_FAILED', message: error.message } });
    }
  }

  async createTask(req, res) {
    try {
      const task = await tasksService.createTask(req.params.projectId, req.params.cid, req.body);
      res.status(201).json({ data: task });
    } catch (error) {
      res.status(400).json({ error: { code: 'CREATE_FAILED', message: error.message } });
    }
  }

  async getTask(req, res) {
    try {
      const task = await tasksService.getTask(req.params.taskId);
      res.json({ data: task });
    } catch (error) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: error.message } });
    }
  }

  async updateTask(req, res) {
    try {
      const task = await tasksService.updateTask(req.params.taskId, req.body);
      res.json({ data: task });
    } catch (error) {
      res.status(400).json({ error: { code: 'UPDATE_FAILED', message: error.message } });
    }
  }

  async deleteTask(req, res) {
    try {
      await tasksService.deleteTask(req.params.taskId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: { code: 'DELETE_FAILED', message: error.message } });
    }
  }

  async moveTask(req, res) {
    try {
      const task = await tasksService.moveTask(req.params.taskId, req.body);
      res.json({ data: task });
    } catch (error) {
      res.status(400).json({ error: { code: 'MOVE_FAILED', message: error.message } });
    }
  }

  async reorderTasks(req, res) {
    try {
      const result = await tasksService.reorderTasks(req.body.columnId, req.body.tasks);
      res.json({ data: result });
    } catch (error) {
      res.status(400).json({ error: { code: 'REORDER_FAILED', message: error.message } });
    }
  }

  async addLabel(req, res) {
    try {
      const result = await tasksService.addLabel(req.params.taskId, req.body.labelId);
      res.status(201).json({ data: result });
    } catch (error) {
      res.status(400).json({ error: { code: 'LABEL_FAILED', message: error.message } });
    }
  }

  async removeLabel(req, res) {
    try {
      await tasksService.removeLabel(req.params.taskId, req.params.labelId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: { code: 'REMOVE_LABEL_FAILED', message: error.message } });
    }
  }

  async watchTask(req, res) {
    try {
      const result = await tasksService.toggleWatch(req.params.taskId, req.user.id, true);
      res.status(201).json({ data: result });
    } catch (error) {
      res.status(400).json({ error: { code: 'WATCH_FAILED', message: error.message } });
    }
  }

  async unwatchTask(req, res) {
    try {
      await tasksService.toggleWatch(req.params.taskId, req.user.id, false);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: { code: 'UNWATCH_FAILED', message: error.message } });
    }
  }
}

module.exports = new TasksController();
