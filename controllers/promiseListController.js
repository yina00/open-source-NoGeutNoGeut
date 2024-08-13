const Promise = require('../models/promise');
const Matching = require('../models/matching');
const SeniorProfile = require('../models/seniorProfile');
const StudentProfile = require('../models/studentProfile');
const { Op } = require('sequelize');
const { format } = require('date-fns');
const Member = require('../models/member');
const InterestField = require("../models/interestField");
const Review = require("../models/review");
const Keep = require("../models/keep");

async function fetchData(userID) {
    try {
        const users = await Member.findOne({ where: { memberNum: userID } });
        console.log("users");
        return users;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function fetchData2(userID) {
    try {
        const senior = await SeniorProfile.findOne({ where: { seniorNum: userID } });
        if (senior) {
            console.log("시니어 회원");
        } else {
            console.log("시니어 회원 아닙니다.");
        }
        return senior;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function fetchData3(userID) {
    try {
        const student = await StudentProfile.findOne({ where: { stdNum: userID } });
        if (student) {
            console.log("주니어 회원");
        } else {
            console.log("주니어 회원이 아닙니다.");
        }
        return student;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function interestFieldData(userID) {
    try {
        const interests = await InterestField.findAll({
            where: { memberNum: userID },
            attributes: ['interestField']
        });
        return interests.map(interest => interest.interestField);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function reviewData(memberNum) {
    try {
        const review = await Review.findAll({ where: { reviewReceiver: memberNum } });
        if (review.length > 0) {
            console.log("있다있어!!!!!!!!!!!!!!");
        } else {
            console.log("없어!!!!!!!");
        }
        return review;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

function calculateKoreanAgeByYear(birthYear) {
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
}

//약속 목록 페이지로 이동
exports.showPromisesList = async (req, res) => {
    try {
        console.log('list page');
        res.render('promiseList');
    } catch (error) {
        console.error('Error redirecting to promises list:', error);
        res.status(500).json({ error: '약속 목록 페이지로 이동하는 동안 오류가 발생했습니다.' });
    }
};

exports.getNotMatchingPromises = async (req, res) => {
    try {
        const user = req.session.userID; //세션 아이디를 가져옴ㅁ
        console.log("user: ", user);

        //모든 약속 조회
        const promises = await Promise.findAll({
            where: {
                [Op.or]: [
                    { stdNum: user },
                    { protectorNum: user }
                ]
            }
        });

        if (!promises || promises.length === 0) {
            return res.render('notMatchingPromiseList', { promises: [] });
        }

        //매칭이 없는 약속 필터링 및 학생과 노인 정보 추가
        const notMatchingPromises = [];

        for (const promise of promises) {
            const matching = await Matching.findOne({ where: { promiseNum: promise.promiseNum } });

            if (!matching) {
                const student = await StudentProfile.findOne({ where: { stdNum: promise.stdNum } });
                const senior = await SeniorProfile.findOne({ where: { seniorNum: promise.protectorNum } });

                //npm install date-fns
                // 날짜 형식을 'yyyy.MM.dd (E)' 형식으로 변환
                const formattedDate = format(new Date(promise.promiseDay), 'yyyy.MM.dd (E)');

                notMatchingPromises.push({
                    promiseNum: promise.promiseNum,
                    date: formattedDate,
                    startTime: promise.startTime,
                    finishTime: promise.finishTime
                });
            }
        }

        return res.render('notMatchingPromiseList', { promises: notMatchingPromises, user:user });

    } catch (error) {
        console.error('Error fetching not matching promises:', error);
        res.status(500).json({ error: '매칭되지 않은 약속 목록을 가져오는 동안 오류가 발생했습니다.' });
    }
};

//약속이 성사된 경우
exports.getMatchingPromises = async (req, res) => {
    try {
        console.log("list matchingComplete page");
        const user = req.session.userID; //세션 아이디를 가져옴
        console.log("user: ", user);

        //모든 약속 조회
        const promises = await Promise.findAll({
            where: {
                [Op.or]: [
                    { stdNum: user },
                    { protectorNum: user }
                ]
            }
        });

        if (!promises || promises.length === 0) {
            //promises: [] => matchingPromises: [] 변경
            return res.render('matchingPromiseList', { matchingPromises: [], user: user });
        }

        //매칭이 있는 약속 필터링 및 학생과 노인 정보 추가
        const matchingPromises = [];

        for (const promise of promises) {
            const matching = await Matching.findOne({ where: { promiseNum: promise.promiseNum } });
            
            if (matching) {
                const student = await fetchData(promise.stdNum);
                const senior = await fetchData2(promise.protectorNum);
                const protector = await fetchData(promise.protectorNum);
                //npm install date-fns
                //날짜 형식을 'yyyy.MM.dd (E)' 형식으로 변환
                const formattedDate = format(new Date(promise.promiseDay), 'yyyy.MM.dd (E)');
/*
                console.log("promise.stdNum: ", promise.stdNum);
                console.log("promise.protectorNum: ", promise.protectorNum);
                console.log("studentName: ", student.name);
                console.log("seniorName: ", senior.seniorName);
                console.log("protectorName: ", protector.name);
                console.log("senior: ", senior);
*/
                matchingPromises.push({
                    promiseNum: promise.promiseNum,
                    studentName: student.name,
                    seniorName: senior.seniorName,
                    protectorName: protector.name,
                    date: formattedDate,
                    startTime: promise.startTime,
                    finishTime: promise.finishTime
                });
            }
        }

        return res.render('matchingPromiseList', { matchingPromises, user: user });

    } catch (error) {
        console.error('Error fetching matching promises:', error);
        res.status(500).json({ error: '매칭된 약속 목록을 가져오는 동안 오류가 발생했습니다.' });
    }
};


//약속 확인 페이지를 보여주는 컨트롤러 함수(거절 수락 선택 페이지)
exports.showPromiseConfirmation = async (req, res) => {
    try {
        const { promiseNum } = req.params;
        const user=req.session.userID;

        //요청이 도착했는지 확인
        console.log(`Received request to show promise complete page for promiseNum: ${promiseNum}`);

        const promise = await Promise.findOne({ where: { promiseNum: promiseNum } });

        if (!promise) {
            console.log(`Promise with ID ${promiseNum} not found.`);
            return res.status(404).json({ error: '약속을 찾을 수 없습니다.' });
        }

        console.log("Promise found:", promise);

        console.log("user: ", user);
        //npm install date-fns
        //날짜 형식을 'yyyy.MM.dd (E)' 형식으로 변환
        const formattedDate = format(new Date(promise.promiseDay), 'yyyy.MM.dd (E)');

        //변환된 날짜를 promise 객체에 추가
        promise.formattedPromiseDay = formattedDate;
        //약속 요청자인지 구분
        let sender;
        if (user === promise.promiseSender){
            sender=user;
        }
        console.log("user: ", user);
        console.log("promise.promiseSender: ", promise.promiseSender);

        //약속 정보를 템플릿에 전달합니다.
        res.render('promiseRequest', { promise: promise, sender, user:user });
    } catch (error) {
        console.error('Error showing promise confirmation page:', error);
        res.status(500).json({ error: '페이지를 불러오는 동안 오류가 발생했습니다.' });
    }
};

exports.showProfileDetail = async (req, res) => {
    try {
        console.log("show promiseSender detail...");
        const { promiseNum, promiseSender } = req.params;
        const user = req.session.userID;

        console.log("promiseNum: ", promiseNum);
        console.log("promiseSender: ", promiseSender);
        console.log("user: ", user);

        const promise = await Promise.findOne({ where: { promiseNum: promiseNum } });
        
        if (!promise) {
            console.log(`Promise with ID ${promiseNum} not found.`);
            return res.status(404).json({ error: '약속을 찾을 수 없습니다.' });
        }
        
        //console.log("promise.stdNum: ", promise.stdNum);
        //console.log("promise.protectorNum: ", promise.protectorNum);

        let student, senior;
        if (parseInt(promiseSender) === promise.stdNum) {
            //student = await StudentProfile.findOne({ where: { stdNum: promise.stdNum } });
            student = await fetchData3(promise.stdNum);

            const year = calculateKoreanAgeByYear(student.yearOfBirth);
            const interestField = await interestFieldData(student.stdNum);
            const review = await reviewData(student.stdNum);
            const encodedImageBase64String = student.profileImage ? Buffer.from(student.profileImage).toString('base64') : '';
            //const member = await fetchData(student.stdNum);
            const member = await fetchData(student.stdNum);
/*
            const keep = await Keep.findOne({
                where: {
                    seniorNum: user.memberNum,
                    stdNum: student.stdNum
                }
            });
            const isKeep = !!keep;
*/
            return res.render('stdDetailedPromise', { student, member, encodedImageBase64String, interests: interestField, review, user:user, age: year, promise });
        } else if (parseInt(promiseSender) === promise.protectorNum) {
            //senior = await SeniorProfile.findOne({ where: { seniorNum: promise.protectorNum } });;
            senior = await fetchData2(promise.protectorNum);

            const year = calculateKoreanAgeByYear(senior.yearOfBirth);
            const interestField = await interestFieldData(senior.seniorNum);
            const review = await reviewData(senior.seniorNum);
            const encodedImageBase64String = senior.profileImage ? Buffer.from(senior.profileImage).toString('base64') : '';
            const member = await fetchData(senior.seniorNum);
            return res.render('seniorDetailedPromise', { senior, member, encodedImageBase64String, interests: interestField, review, user:user, age: year, promise });
        } else {
            console.log("Invalid userProfile.");
            return res.status(400).json({ error: '올바르지 않은 사용자 프로필입니다.' });
        }
/*
        if (student) {
            const year = calculateKoreanAgeByYear(student.yearOfBirth);
            const interestField = await interestFieldData(student.stdNum);
            const review = await reviewData(student.stdNum);
            const encodedImageBase64String = student.profileImage ? Buffer.from(student.profileImage).toString('base64') : '';
            //const member = await fetchData(student.stdNum);
            const member = await fetchData(student.stdNum);

            // Check if the student is already in the keep list
            const keep = await Keep.findOne({
                where: {
                    seniorNum: user.memberNum,
                    stdNum: student.stdNum
                }
            });
            const isKeep = !!keep;

            return res.render('stdDetailedPromise', { student, member, encodedImageBase64String, interests: interestField, review, isKeep, user, age: year });
        } else if (senior) {
            const year = calculateKoreanAgeByYear(senior.yearOfBirth);
            const interestField = await interestFieldData(senior.seniorNum);
            const review = await reviewData(senior.seniorNum);
            const encodedImageBase64String = senior.profileImage ? Buffer.from(senior.profileImage).toString('base64') : '';
            const member = await fetchData(senior.seniorNum);
            return res.render('seniorDetailedPromise', { senior, member, encodedImageBase64String, interests: interestField, review, user, age: year });
        } else {
            return res.status(404).send('회원 정보를 찾을 수 없습니다.');
        }
*/
    } catch (error) {
        res.status(500).send(error.message);
    }
}


//약속 거절
exports.rejectProfilePromise = async (req, res) => {
    try {
        const { promiseNum } = req.params;

        //약속을 찾고 삭제합니다.
        const deletedPromise = await Promise.destroy({ where: { promiseNum: promiseNum } });

        if (!deletedPromise) {
            return res.status(404).json({ error: '삭제할 약속을 찾을 수 없습니다.' });
        }

        //res.status(200).json({ message: '약속이 성공적으로 거절되었습니다.' }); //약속 목록 페이지로 리다이렉션
        res.redirect('/promiseList');
    } catch (error) {
        console.error('Error rejecting promise:', error);
        res.status(500).json({ error: '약속을 거절하는 동안 오류가 발생하였습니다.' });
    }
}

//약속 수락 후 입금 확인 페이지로 이동
exports.acceptPromise = async (req, res) => {
    try {
        const { promiseNum } = req.params;

        //입금 확인 페이지로 넘어가도록 리다이렉트합니다.
        //res.redirect(`/${stdNum}/${promiseNum}/deposit`); //경로 수정
        const promise = await Promise.findOne({ where: { promiseNum: promiseNum } });

        const newMatching = await Matching.create({
            promiseNum: promise.promiseNum,  //생성된 약속의 promiseNum 사용
            reportNum: null,
            depositStatus: false,
            reportStatus: false
        });

        console.log("Matching created:", newMatching);

        res.status(200).json({ redirectUrl: `/promiseList` });
    } catch (error) {
        console.error('Error accepting promise:', error);
        res.status(500).json({ error: '약속을 수락하는 동안 오류가 발생하였습니다.' });
    }
}
/*
//입금확인창
exports.showPromiseDeposit = async (req, res) => {
    try {
        console.log("render deposit page");
        const { promiseNum } = req.params;

        //요청이 도착했는지 확인
        console.log(`Received request to show promise complete page for promiseNum: ${promiseNum}`);

        const promise = await Promise.findOne({ where: { promiseNum: promiseNum } });

        if (!promise) {
            console.log(`Promise with ID ${promiseNum} not found.`);
            return res.status(404).json({ error: '약속을 찾을 수 없습니다.' });
        }

        console.log("Promise found:", promise);

        //npm install date-fns
        const formattedDate = format(new Date(promise.promiseDay), 'yyyy.MM.dd (E)');

        //변환된 날짜를 promise 객체에 추가
        promise.formattedPromiseDay = formattedDate;
        //목록페이지로 리다이렉트
        res.render('promiseDeposit', { promise: promise });
    } catch (error) {
        console.error('Error showing promise page:', error);
        res.status(500).json({ error: '페이지를 불러오는 동안 오류가 발생했습니다.' });
    }
};
*/

exports.showProfileDepoistDetail = async (req, res) => {
    try {
        console.log("show student deposit detail...");
        const { promiseNum, stdNum } = req.params;
        const user = req.session.userID;

        console.log("promiseNum: ", promiseNum);
        //console.log("promiseSender: ", stdNum);
        console.log("user: ", user);

        const promise = await Promise.findOne({ where: { promiseNum: promiseNum } });

        if (!promise) {
            console.log(`Promise with ID ${promiseNum} not found.`);
            return res.status(404).json({ error: '약속을 찾을 수 없습니다.' });
        }

        let student;
        if (parseInt(stdNum) === promise.stdNum) {
            student = await fetchData3(promise.stdNum);

            const year = calculateKoreanAgeByYear(student.yearOfBirth);
            const interestField = await interestFieldData(student.stdNum);
            const review = await reviewData(student.stdNum);
            const encodedImageBase64String = student.profileImage ? Buffer.from(student.profileImage).toString('base64') : '';
            //const member = await fetchData(student.stdNum);
            const member = await fetchData(student.stdNum);

            return res.render('stdPromiseDepositDetail', { student, member, encodedImageBase64String, interests: interestField, review, user:user, age: year, promise });
        }else {
            console.log("Invalid userProfile.");
            return res.status(400).json({ error: '올바르지 않은 사용자 프로필입니다.' });
        }

    } catch (error) {
        res.status(500).send(error.message);
    }
}

exports.showPromiseDeposit = async (req, res) => {
    try {
        console.log("render deposit page");
        const { promiseNum } = req.params;
        const user = req.session.userID; //세션에서 현재 사용자 정보 가져오기

        console.log(`Received request to show promise complete page for promiseNum: ${promiseNum}`);

        const promise = await Promise.findOne({ where: { promiseNum: promiseNum } });

        if (!promise) {
            console.log(`Promise with ID ${promiseNum} not found.`);
            return res.status(404).json({ error: '약속을 찾을 수 없습니다.' });
        }

        console.log("Promise found:", promise);
        const matching = await Matching.findOne({ where: { promiseNum: promiseNum } });
        const depositStatus = matching ? matching.depositStatus : false;
        const reportStatus = matching ? matching.reportStatus : false;
        const student = await Member.findOne({ where: { memberNum: promise.stdNum } });
        const protector = await Member.findOne({ where: { memberNum: promise.protectorNum } });
        const senior = await SeniorProfile.findOne({ where: { seniorNum: promise.protectorNum } });

        const formattedDate = format(new Date(promise.promiseDay), 'yyyy.MM.dd (E)');

        promise.formattedPromiseDay = formattedDate;

        console.log("user: ", user);
        console.log("promise stdNum: ", promise.stdNum);
        console.log("promise seniorNum: ", promise.protectorNum);

        const promiseDetail = {
            studentName: student.name,
            protectorName: protector.name,
            seniorName: senior.seniorName,
        }
/*
        if (user === promise.stdNum) {
            // 학생의 경우
            if (!matching.reportNum) {
                // 보고서가 작성되지 않은 경우
                res.render('stdPromiseDeposit', { stdNum: promise.stdNum, promise: promise, matching: matching, promiseDetail, depositStatus: depositStatus, reportNotWritten: false });
            } else {
                // 보고서가 작성된 경우
                res.render('stdPromiseDeposit', { stdNum: promise.stdNum, promise: promise, matching: matching, promiseDetail, depositStatus: depositStatus, reportNotWritten: true });
            }
        } else if (user === promise.protectorNum) {
            // 보호자의 경우
            res.render('seniorPromiseDeposit', { seniorNum: promise.protectorNum, promise: promise, matching: matching, promiseDetail, depositStatus: depositStatus, reportStatus: reportStatus });
        } else {
            console.log("Invalid userProfile.");
            return res.status(400).json({ error: '올바르지 않은 사용자 프로필입니다.' });
        }    
*/
        if (user === promise.stdNum) {
            //res.render('stdPromiseDeposit', { stdNum:promise.stdNum, promise: promise, depositStatus: depositStatus });
            //res.render('stdPromiseDeposit', { stdNum: promise.stdNum, promise: promise, matching: matching });
            res.render('stdPromiseDeposit', { user:user, stdNum: promise.stdNum, promise: promise, matching: matching, promiseDetail, depositStatus: depositStatus, reportStatus: reportStatus });
        } else if (user === promise.protectorNum) {
            //res.render('seniorPromiseDeposit', { seniorNum: promise.protectorNum, promise: promise, depositStatus: depositStatus });
            res.render('seniorPromiseDeposit', { user:user, seniorNum: promise.protectorNum, promise: promise, matching: matching, promiseDetail, depositStatus: depositStatus, reportStatus: reportStatus });
        } else {
            console.log("Invalid userProfile.");
            return res.status(400).json({ error: '올바르지 않은 사용자 프로필입니다.' });
        }  

        console.log("입금 여부", depositStatus);
        console.log("보고서 확인 여부", reportStatus);
    } catch (error) {
        console.error('Error showing promise page:', error);
        res.status(500).json({ error: '페이지를 불러오는 동안 오류가 발생했습니다.' });
    }
};

exports.confirmDeposit = async (req, res) => {
    try {
        const { promiseNum } = req.params;

        //요청이 도착했는지 확인
        console.log(`Received request to show promise complete page for promiseNum: ${promiseNum}`);

        const matching = await Matching.findOne({ where: { promiseNum: promiseNum } });

        if (!matching) {
            console.log(`Matching record for promise number ${promiseNum} not found.`);
            return res.status(404).json({ error: '매칭 레코드를 찾을 수 없습니다.' });
        }

        matching.depositStatus = true;
        await matching.save();

        console.log(`Deposit confirmation for promise number ${promiseNum} updated successfully.`);

        //성공적으로 업데이트되었음을 응답합니다.
        //res.status(200).json({ message: '입금 확인이 정상적으로 완료되었습니다.' });
        res.redirect('/promiseList/matchingPromiseList');
    } catch (error) {
        console.error('Error confirming deposit:', error);
        res.status(500).json({ error: '입금 확인 중 오류가 발생했습니다.' });
    }
};