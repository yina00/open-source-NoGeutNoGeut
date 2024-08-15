// routes/googleRoutes.js
const express = require('express');
const passport = require('../config/passportConfig');
const router = express.Router();

// 구글 로그인 시작
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 구글 로그인 콜백
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    async (req, res) => {
        console.log('User:', req.user);

        if (!req.user) {
            return res.redirect('/login');
        }

        req.session.user = req.user;
        req.session.userID = req.user.memberNum;
        req.session.userType = req.user.userType;

        if (!req.user.age || !req.user.userType) {
            console.log('프로필 정보가 완전하지 않음, /complete-profile로 리다이렉트');
            return res.redirect('/complete-profile');
        }

        if (req.user.profileCreationStatus) {
            console.log('프로필 생성 상태: true');
            return res.redirect('/main');
        } else {
            console.log('프로필 생성 상태: false');
            return res.redirect('/creation');
        }
    }
);

module.exports = router;


