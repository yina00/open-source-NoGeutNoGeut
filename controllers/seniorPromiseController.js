const { format } = require('date-fns');
const Promise = require("../models/promise");
const SeniorProfile = require("../models/seniorProfile");
const StudentProfile = require("../models/studentProfile");
const ChatRoom = require("../models/chatRoom");
const Matching = require("../models/matching");

//노인프로필과 약속
exports.showSnProfilePromisePage = async (req, res) => {
    try {
        const user = req.session.userID;
        const seniorNum = req.params.seniorNum;

        const seniorProfile = await SeniorProfile.findOne({ where: { seniorNum: seniorNum } });

        if (!seniorProfile) {
            return res.status(400).json({ error: '학생 정보를 찾을 수 없습니다.' });
        }

        console.log(`user: ${user}`);
        console.log(`seniorNum: ${seniorNum}`)

        console.log("start promise page");
        res.render('seniorPromise', { seniorNum: seniorNum, user: user });
    } catch (error) {
        console.error('Error showing promise page:', error);
        res.status(500).json({ error: '페이지를 불러오는 동안 오류가 발생했습니다.' });
    }
};

//db에 약속 정보 저장
exports.createSnProfilePromise = async (req, res) => {
    try {
        //const stdNum = req.params.stdNum;
        const seniorNum = req.params.seniorNum;
        const user = req.session.userID;
        const { promiseDay, startTime, finishTime } = req.body;

        console.log("Promise creation process started.");
        console.log("Request params:", req.params);
        console.log("Request body:", req.body);

        const promise = await Promise.create({
            //promiseNum: ,
            stdNum: user,
            protectorNum: seniorNum,
            roomNum: 1,
            //promiseCreationDate: ,
            promiseDay: promiseDay,
            startTime: startTime,
            finishTime: finishTime,
            //textSendingStatus: 
            promiseSender: user
        });

        console.log("Promise created:", promise);
        /*
                // 약속 생성 후 매칭 레코드 생성
                const newMatching = await Matching.create({
                    promiseNum: promise.promiseNum,  // 생성된 약속의 promiseNum 사용
                    reportNum: null,
                    depositStatus: false,
                    reportStatus: false
                });
        
                console.log("Matching created:", newMatching);
        */

        //res.status(201).json(promise); // 약속 목록 페이지로 리다이렉션
        res.redirect(`/promiseToSn/${seniorNum}/${promise.promiseNum}`);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: '약속을 작성하는 동안 오류가 발생하였습니다.' });
    }
}

//요청 완료된 창
exports.showPromiseRequest = async (req, res) => {
    try {
        const { seniorNum, promiseNum } = req.params;
        const user = req.session.userID;

        //요청이 도착했는지 확인
        console.log(`Received request to show promise complete page for seniorNum: ${seniorNum},promiseNum: ${promiseNum}`);

        const promise = await Promise.findOne({ where: { promiseNum: promiseNum } });

        if (!promise) {
            console.log(`Promise with ID ${promiseNum} not found.`);
            return res.status(404).json({ error: '약속을 찾을 수 없습니다.' });
        }

        console.log("Promise found:", promise);

        //npm install date-fns
        // 날짜 형식을 'yyyy.MM.dd (E)' 형식으로 변환
        const formattedDate = format(new Date(promise.promiseDay), 'yyyy.MM.dd (E)');

        // 변환된 날짜를 promise 객체에 추가
        promise.formattedPromiseDay = formattedDate;

        res.render('seniorPromiseSender', { seniorNum: seniorNum, promise: promise, user: user });
    } catch (error) {
        console.error('Error showing promise page:', error);
        res.status(500).json({ error: '페이지를 불러오는 동안 오류가 발생했습니다.' });
    }
};
