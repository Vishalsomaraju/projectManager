const express = require('express');
const columnsController = require('../controllers/columns.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireProjectAccess } = require('../middleware/project.middleware');

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get('/', requireProjectAccess('VIEWER'), columnsController.listColumns);
router.post('/', requireProjectAccess('MEMBER'), columnsController.createColumn);
router.patch('/:columnId', requireProjectAccess('MEMBER'), columnsController.updateColumn);
router.delete('/:columnId', requireProjectAccess('ADMIN'), columnsController.deleteColumn);
router.post('/reorder', requireProjectAccess('MEMBER'), columnsController.reorderColumns);

module.exports = router;
