const express = require('express');
const router = express.Router();
const mainhomeController = require('../controllers/mainhomeController');

//로그인 필요 없는 메인 홈 라우트
router.get('/', mainhomeController.connect);

module.exports = router;
