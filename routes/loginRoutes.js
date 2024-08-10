const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.get('/login', loginController.login);
router.post('/login', loginController.postLogin);
router.get('/logout', loginController.logout);
router.get('/signup', loginController.renderSignup); //회원가입 페이지로 이동하는 라우트
router.post('/signup', loginController.signup); //회원가입 처리 라우트

module.exports = router;
