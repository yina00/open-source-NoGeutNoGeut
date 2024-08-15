const express = require('express');
const router = express.Router();
const postListController = require('../controllers/postListController');
const multer = require('multer');
const path = require('path');

router.get('/:boardID', postListController.getBoardsAndPost);
router.get('/search/:boardID', postListController.searchPost);

module.exports = router;