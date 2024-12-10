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

// 댓글 및 답글 삭제 라우트 추가
router.post('/:id/comment/:commentID/delete', postController.deleteComment);
router.post('/:id/comment/:commentID/reply/delete', postController.deleteComment);

module.exports = router;
