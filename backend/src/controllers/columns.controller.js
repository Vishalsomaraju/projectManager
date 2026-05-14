const columnsService = require('../services/columns.service');

class ColumnsController {
  async listColumns(req, res) {
    try {
      const columns = await columnsService.listColumns(req.params.projectId);
      res.json({ data: columns });
    } catch (error) {
      res.status(500).json({ error: { code: 'LIST_FAILED', message: error.message } });
    }
  }

  async createColumn(req, res) {
    try {
      const column = await columnsService.createColumn(req.params.projectId, req.body);
      res.status(201).json({ data: column });
    } catch (error) {
      res.status(400).json({ error: { code: 'CREATE_FAILED', message: error.message } });
    }
  }

  async updateColumn(req, res) {
    try {
      const column = await columnsService.updateColumn(req.params.columnId, req.body);
      res.json({ data: column });
    } catch (error) {
      res.status(400).json({ error: { code: 'UPDATE_FAILED', message: error.message } });
    }
  }

  async deleteColumn(req, res) {
    try {
      await columnsService.deleteColumn(req.params.columnId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: { code: 'DELETE_FAILED', message: error.message } });
    }
  }

  async reorderColumns(req, res) {
    try {
      const { columns } = req.body;
      const result = await columnsService.reorderColumns(req.params.projectId, columns);
      res.json({ data: result });
    } catch (error) {
      res.status(400).json({ error: { code: 'REORDER_FAILED', message: error.message } });
    }
  }
}

module.exports = new ColumnsController();
