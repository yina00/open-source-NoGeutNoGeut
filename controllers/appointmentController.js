const { format } = require('date-fns');
const Promise = require("../models/promise");
const SeniorProfile = require("../models/seniorProfile");
const StudentProfile = require("../models/studentProfile");
const ChatRoom = require("../models/chatRoom");
const Matching = require("../models/matching");

//학생프로필과 약속
exports.showPage = async (req, res) => {
    try {
        console.log("약속 페이지 렌더링");
        res.render('appointment');
    } catch (error) {
        console.error('Error showing promise page:', error);
        res.status(500).json({ error: '페이지를 불러오는 동안 오류가 발생했습니다.' });
    }
};
