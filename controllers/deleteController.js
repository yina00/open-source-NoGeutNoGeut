//
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const Member = require('../models/member');
const InterestField = require('../models/interestField');
const StudentProfile = require('../models/studentProfile');
const SeniorProfile = require('../models/seniorProfile');
const Promise = require("../models/promise");
const Keep = require("../models/keep");
const Report = require('../models/report');
const Review = require('../models/review');
const Matching = require('../models/matching');
const MemberChatRoom = require('../models/memberChatRoom');
const ChatRoom = require('../models/chatRoom');
const Message = require('../models/message');
const Comment = require('../models/comment');
const Post = require('../models/post');

// 게시판 삭제
exports.board_delete = async (req, res, next) => {
    try {
        const memberNum = req.session.userID;

        console.log('회원 번호: ', memberNum);

        await Comment.destroy({ where: { memberNum: memberNum } });
        await Post.destroy({ where: { memberNum: memberNum } });

        console.log('게시판 관련 데이터 삭제 성공');
        next();

    } catch (error) {
        console.log('게시판 관련 데이터 삭제 중 오류가 발생했습니다.',error);
        res.status(500).send('게시판 관련 데이터 삭제 중 오류가 발생했습니다.');
    }
};

// 리뷰-보고서-약속 삭제
exports.record_delete = async (req, res, next) => {
    try {
        const memberNum = req.session.userID;
        console.log('memberNum: ', memberNum);

        await Keep.destroy({
            //수정
                where: {
                    [Op.or]: [
                        { stdNum: memberNum },
                        { seniorNum: memberNum }
                    ]}
            });

        await Review.destroy({
            where: { reviewReceiver: memberNum } // 리뷰 삭제(내가 작성한 후기는 세이브)
        });

        await Report.destroy({
            where: {
                [Op.or]: [
                    { stdNum: memberNum },
                    { seniorNum: memberNum }
                ]}
        });

        await Promise.destroy({
            where: {
                [Op.or]: [
                    { stdNum: memberNum },
                    { protectorNum: memberNum }
                ]}
        });

        console.log('리뷰-보고서-약속 데이터 삭제 성공');
        next();

    } catch (error) {
        console.log('이용 기록 삭제 중 오류가 발생했습니다.',error);
        res.status(500).send('이용 기록 삭제 중 오류가 발생했습니다.');
    }
};

// 기본 정보 삭제 + 세션 삭제 추가하기
exports.user_delete = async (req, res) => {
    try {
        const memberNum = req.session.userID;
        const userType = req.session.userType;
        console.log('회원 번호: ', memberNum);
        console.log('회원 유형: ', userType);

        await InterestField.destroy({ where: { memberNum: memberNum } });

        if (userType === 'student') {
            await StudentProfile.destroy({ where: { stdNum: memberNum } });
            console.log('학생 프로필 삭제 완료');
        }
        else if (userType === 'senior') {
            await SeniorProfile.destroy({ where: { seniorNum: memberNum } });
            console.log('시니어 프로필 삭제 완료');
        }

        await Member.destroy({ where: { memberNum: memberNum } });

        req.session.destroy(err => {
            if (err) {
                console.log('세션 종료 중 오류가 발생했습니다.', err);
                return res.status(500).send('세션 종료 중 오류가 발생했습니다.');
            }
            console.log('계정 삭제 성공 및 세션 종료 완료');
            res.redirect('/');
        });

    } catch (error) {
        console.log('계정 삭제 중 오류가 발생했습니다.', error);
        res.status(500).send('계정 삭제 중 오류가 발생했습니다.');
    }
};



//------------------------------------------------

// 매칭 삭제 (미완)
/*
exports.goodbye= async (req, res) => {
    try {
        const memberNum = req.session.userID;
        console.log('memberNum: ', memberNum);

        //학생과 노인 번호가 NULL이라서 - 해결해야됨
        const promise = await Promise.findOne({
            where: {
                [Op.or]: [
                    { stdNum: memberNum },
                    { seniorNum: memberNum }
                ]}
        });

        await Matching.destroy({
            where: { promiseNum: promise.promiseNum }
        });

        console.log('테스트 성공');
        res.redirect('/');

    } catch (error) {
        console.log('매칭 삭제 중 오류가 발생했습니다.',error);
        res.status(500).send('매칭 삭제 중 오류가 발생했습니다.');
    }
}; */

// 채팅 삭제
exports.chat_delete = async (req, res, next) => {
    try {
        const memberNum = req.session.userID;

        console.log('회원 번호: ', memberNum);

        await MemberChatRoom.destroy({ where: { memberNum: memberNum } });

        //
        await ChatRoom.destroy({
            where: {
                [Op.or]: [
                    { stdNum: memberNum },
                    { protectorNum: memberNum }
                ]}
        });

        await Message.destroy({
            where: {
                [Op.or]: [
                    { senderNum : memberNum }, //유지
                    { receiverNum: memberNum }
                ]}
        });

        console.log('채팅 기록 삭제 성공');
        res.next();

    } catch (error) {
        console.log('채팅 관련 데이터 삭제 중 오류가 발생했습니다.',error);
        res.status(500).send('채팅 관련 데이터 삭제 중 오류가 발생했습니다.');
    }
};

// 찜 삭제 (노인만)
exports.keep_delete = async (req, res) => {
    try {
        const memberNum = req.session.userID;
        console.log('memberNum: ', memberNum);

        await Keep.destroy({
        //수정
            where: {
                [Op.or]: [
                    { stdNum: memberNum },
                    { seniorNum: memberNum }
                ]}
        });

        console.log('테스트 성공');
        res.redirect('/');

    } catch (error) {
        console.log('찜 목록 삭제 중 오류가 발생했습니다.',error);
        res.status(500).send('찜 목록 삭제 중 오류가 발생했습니다.');
    }
};