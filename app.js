const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const app = express();

// 세션 설정
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: true }));

// Passport 초기화 및 세션 설정
app.use(passport.initialize());
app.use(passport.session());

// Passport 설정
passport.use(new GoogleStrategy({
    clientID: '1089379524523-0nrbren0tpts0509nf99f4i8pt4cjd8g.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    // 사용자의 프로필을 저장하거나 처리
    return done(null, profile);
  }
));

// 세션에 사용자 정보를 저장
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Google 로그인 라우트
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

// Google 로그인 콜백 라우트
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // 로그인 성공 후 리다이렉트
    res.redirect('/');
  }
);

// 로그아웃 라우트
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// 홈 페이지 라우트
app.get('/', (req, res) => {
  res.send(`<h1>Home</h1><p>${req.isAuthenticated() ? `Hello, ${req.user.displayName}` : '<a href="/auth/google">Login with Google</a>'}</p>`);
});

// 서버 실행
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
