const express = require('express');
const tasksController = require('../controllers/tasks.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireProjectAccess } = require('../middleware/project.middleware');

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// Project level tasks
router.get('/projects/:projectId/tasks', requireProjectAccess('VIEWER'), tasksController.listTasks);
router.get('/projects/:projectId/columns/:cid/tasks', requireProjectAccess('VIEWER'), tasksController.listColumnTasks);
router.post('/projects/:projectId/columns/:cid/tasks', requireProjectAccess('MEMBER'), tasksController.createTask);

// Task level operations
router.get('/tasks/:taskId', tasksController.getTask); // Note: Should ideally check project access here too
router.patch('/tasks/:taskId', tasksController.updateTask);
router.delete('/tasks/:taskId', tasksController.deleteTask);
router.post('/tasks/:taskId/move', tasksController.moveTask);
router.post('/tasks/reorder', tasksController.reorderTasks);
router.post('/tasks/:taskId/labels', tasksController.addLabel);
router.delete('/tasks/:taskId/labels/:labelId', tasksController.removeLabel);
router.post('/tasks/:taskId/watch', tasksController.watchTask);
router.delete('/tasks/:taskId/watch', tasksController.unwatchTask);

module.exports = router;
