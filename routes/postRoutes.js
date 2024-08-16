const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/renderCreatePost', postController.renderCreatePost);
router.post('/create', postController.createPost);

router.get('/createdList', postController.renderCreatedList);
router.get('/createdPostList', postController.renderCreatedPostList);
router.get('/createdCommentList', postController.renderCreatedCommentList);

router.get('/:id(\\d+)', postController.viewPost);
router.post('/:id/comment', postController.createComment);
router.post('/:id/comment/:commentID/reply', postController.createReply);

module.exports = router;