const express = require('express');
const commentsController = require('../controllers/comments.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get('/', commentsController.listComments);
router.post('/', commentsController.createComment);
router.patch('/:commentId', commentsController.updateComment);
router.delete('/:commentId', commentsController.deleteComment);

module.exports = router;
