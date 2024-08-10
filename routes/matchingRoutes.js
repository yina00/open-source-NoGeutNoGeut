const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');

//매칭 완료 라우트
router.post('/completeMatching', matchingController.completeMatching);

module.exports = router;
