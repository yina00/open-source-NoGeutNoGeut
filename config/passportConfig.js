const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy; // 이 줄을 추가합니다.
const Member = require('../models/member');
const bcrypt = require('bcryptjs');

// 로컬 전략 설정
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await Member.findOne({ where: { email } });
        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }
        const isMatch = await bcrypt.compare(password, user.memberPW);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Google OAuth 전략 설정
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3030/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await Member.findOne({ where: { googleId: profile.id } });

        if (!user) {
            user = await Member.create({
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
                memberPW: '',  // 기본값으로 빈 문자열 설정
                profileCreationStatus: false, // 기본값 false
                age:null
            });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));
passport.serializeUser((user, done) => {
  done(null, user.memberNum);
});

passport.deserializeUser(async (memberNum, done) => {
  try {
    const user = await Member.findOne({ where: { memberNum: memberNum } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});


module.exports = passport;


