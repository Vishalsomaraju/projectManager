const express = require('express');
const projectsController = require('../controllers/projects.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireProjectAccess } = require('../middleware/project.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', projectsController.listProjects);
router.post('/', projectsController.createProject);

router.get('/:projectId', requireProjectAccess('VIEWER'), projectsController.getProject);
router.patch('/:projectId', requireProjectAccess('ADMIN'), projectsController.updateProject);
router.delete('/:projectId', requireProjectAccess('OWNER'), projectsController.archiveProject);

router.get('/:projectId/members', requireProjectAccess('VIEWER'), projectsController.listMembers);
router.post('/:projectId/members', requireProjectAccess('ADMIN'), projectsController.inviteMember);
router.patch('/:projectId/members/:uid', requireProjectAccess('OWNER'), projectsController.updateMemberRole);
router.delete('/:projectId/members/:uid', requireProjectAccess('OWNER'), projectsController.removeMember);

router.post('/join/:token', projectsController.joinProject);

module.exports = router;
