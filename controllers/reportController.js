/*
* 학생(목록 2개) - 내가 쓴 보고서 목록, 내가 써야하는 보고서 목록(약속으로 잡혔는데 보고서 안 쓴 것만 보여줌)
* 내가 써야하는 보고서 목록에서 클릭 -> 해당 보고서 작성 페이지로 이동( 예시 페이지로 가는 버튼 추가)
* 확인 클릭하면 -> 노인의 보고서 목록과 학생의 내가 쓴 보고서 목록에 뜸
*
* 노인(목록 1개) - 학생으로부터 받은 보고서를 볼 수 있음 (보고서 목록)
* 상세 보고서 확인 페이지(확인 버튼 클릭 시 - 노인과 학생 둘 다 매칭 카운트 +1, 확인은 한 번만 누를 수 있음, 확인 버튼 누른 시간 저장)
*
*/


const Member = require('../models/member');
const Promise = require('../models/promise');
const SeniorProfile = require('../models/seniorProfile');
const Report = require("../models/report");
const Matching = require('../models/matching');
const StudentProfile = require('../models/studentProfile');
const { Op, Sequelize } = require('sequelize');
const multer = require('multer');
const sequelize = require('../config/database');


const sortOptions = {
  latest: ['createdAt', 'DESC'],
  oldest: ['createdAt', 'ASC']
};


async function fetchData(reportNum) {
    try {
        const report = await Report.findOne({ where: { reportNum } });
        return report;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

//보고서 작성하는 폼 보여주는 거
exports.showReportForm = async (req, res) => {
    try {
        const promiseNum = req.query.promiseNum;
        const userID = req.session.userID;

        //약속이 없는 경우 에러
        if (!promiseNum) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        //사용자의 ID랑 맞는 약속 정보 조회함
        const promise = await Promise.findOne({
            where: {
                promiseNum: promiseNum,
                stdNum: userID
            }
        });

        if (!promise) {
            return res.status(400).json({ error: 'Promise not found' });
        }

        const student = await Member.findOne({ where: { memberNum: promise.stdNum } });
        const senior = await SeniorProfile.findOne({ where: { seniorNum: promise.protectorNum } });

        if (!student || !senior) {
            return res.status(400).json({ error: 'Related members not found' });
        }

        //약속세부정보 구성하고 렌더링함
        const promiseDetails = {
            promiseNum: promise.promiseNum,
            studentNum: promise.stdNum,
            protectorNum: promise.protectorNum,
            seniorNum: promise.protectorNum,
            studentName: student.name,
            seniorName: senior.seniorName,
            promiseDate: promise.promiseCreationDate,
            startTime: promise.startTime
        };

        res.render('reportForm', { promiseDetails });
    } catch (error) {
        console.error('Error fetching promise details:', error);
        res.status(500).json({ error: 'Error fetching promise details' });
    }
};

//보고서 제출하는 함수
exports.submitReport = async (req, res) => {
    try {
        const { reportContent, seniorNum, stdNum, promiseNum } = req.body;
        const reportMedia = req.file;

        const newReport = await Report.create({
            reportContent: reportContent,
            reportMedia: reportMedia.buffer,
            seniorNum: seniorNum,
            stdNum: stdNum
        });

        //매칭정보도 업데이트해야함
        await Matching.update(
            { reportNum: newReport.reportNum, reportStatus: true },
            { where: { promiseNum: promiseNum } }
        );

        res.redirect('/reportList');
    } catch (error) {
        console.error('Error submitting report:', error);
        res.status(500).json({ error: 'Report submission failed' });
    }
};


//사용자 확인하고 보고서 목록 조회
exports.listReports = async (req, res) => {
    try {
        const userID = req.session.userID;

        if (!userID) {
            return res.status(401).json({ error: '사용자가 로그인하지 않았습니다.' });
        }

        const userType = req.session.userType;

        //학생이면 노인인면 구분해야함
        if (userType === 'student') {
            const reports = await Report.findAll({
                where: {
                    stdNum: userID
                }
            });

            res.render('reportListStudent', { reports });
        } else if (userType === 'senior') {
            const reports = await Report.findAll({
                where: {
                    seniorNum: userID
                }
            });

            res.render('reportListSenior', { reports });
        } else {
            return res.status(400).json({ error: '알 수 없는 사용자 유형입니다.' });
        }
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
};

//목록에서 눌러서 보고서 디테일하게조회
exports.viewReport = async (req, res) => {
    try {
        const reportNum = req.params.reportNum;
        const report = await Report.findOne({ where: { reportNum } });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const base64Image = Buffer.from(report.reportMedia, 'binary').toString('base64');

        const student = await Member.findOne({ where: { memberNum: report.stdNum } });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const senior = await SeniorProfile.findOne({ where: { seniorNum: report.seniorNum } });
        if (!senior) {
            return res.status(404).json({ error: 'Senior not found' });
        }

        const promise = await Promise.findOne({ where: { stdNum: report.stdNum, protectorNum: report.seniorNum } });
        if (!promise) {
            return res.status(404).json({ error: 'Promise not found' });
        }

        res.render('reportDetail', {
            report: report,
            student: student,
            senior: senior,
            base64Image: base64Image,
            user: req.session.user,
            promiseDay: promise.promiseDay,
            startTime: promise.startTime,
            finishTime: promise.finishTime
        });
    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
};

//pending중인 보고서 조회하는 거
//내가 써야하는 보고서 목록
exports.pendingReports = async (req, res) => {
    try {
        const userID = req.session.userID;

        //지금 사용자ID랑 같은 거 근데 레포트상태 f인 거
        const pendingReports = await Matching.findAll({
            where: {
                reportStatus: false,
                '$Promise.stdNum$': userID
            },
            include: [
                {
                    model: Promise,
                    required: true
                }
            ]
        });

        const reports = [];
        for (const pendingReport of pendingReports) {
            const student = await StudentProfile.findOne({ where: { stdNum: pendingReport.Promise.stdNum } });
            const senior = await SeniorProfile.findOne({ where: { seniorNum: pendingReport.Promise.protectorNum } });

            reports.push({
                matchingNum: pendingReport.matchingNum,
                promiseNum: pendingReport.promiseNum,
                studentName: student ? student.name : 'Unknown',
                seniorName: senior ? senior.seniorName : 'Unknown'
            });
        }

        res.render('pendingReports', { reports });
    } catch (error) {
        console.error('Error fetching pending reports:', error);
        res.status(500).json({ error: 'Pending reports could not be fetched.' });
    }
};


//보고서 목록 페이지 렌더링하는 함수
exports.renderReportListPage = async (req, res) => {
    try {
        const userID = req.session.userID;
        const userType = req.session.userType;
        const sortBy = req.query.sortBy || 'latest';
        const order = sortOptions[sortBy] || sortOptions.latest;

        if (!userID) {
            return res.status(401).json({ error: '사용자가 로그인하지 않았습니다.' });
        }

        let reports = [];


        if (userType === 'student') {
            reports = await Report.findAll({
                where: { stdNum: userID },
                include: [
                    {
                        model: SeniorProfile,
                        as: 'seniorProfile',
                        attributes: ['seniorName', 'profileImage']
                    }
                ],
                order: [order]
            });
            res.render('reportListStudent', { reports, sortBy });
        } else if (userType === 'senior') {
            reports = await Report.findAll({
                where: { seniorNum: userID },
                include: [
                    {
                        model: StudentProfile,
                        as: 'studentProfile',
                        attributes: ['profileImage']
                    },
                    {
                        model: Member,
                        as: 'student',
                        attributes: ['name']
                    }
                ],
                order: [order]
            });
            res.render('reportListSenior', { reports, sortBy });
        } else {
            res.status(400).json({ error: '알 수 없는 사용자 유형입니다.' });
        }

    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
};

//노인 쪽에서 보고서 확인하면 매칭 횟수랑 매칭시간 업데이트
exports.confirmReport = async (req, res) => {
    try {
        const reportNum = req.params.reportNum;
        const report = await Report.findOne({ where: { reportNum } });

        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const studentProfile = await StudentProfile.findOne({ where: { stdNum: report.stdNum } });
        const seniorProfile = await SeniorProfile.findOne({ where: { seniorNum: report.seniorNum } });

        if (!studentProfile || !seniorProfile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        console.log('Incrementing matching count for student and senior');

        //학생이랑 노인 둘다 1씩 증가함
        await studentProfile.increment('matchingCount');
        await seniorProfile.increment('matchingCount');

        //최근매칭시간 업데이트함
        const currentTime = new Date();
        await studentProfile.update({ recentMatchingTime: currentTime });
        await seniorProfile.update({ recentMatchingTime: currentTime });

        //레포트 테이블 보고서 상태 업데이트
        //updatedAt 필드 갱신
        report.reportStatus = true;
        report.updatedAt = currentTime;
        await report.save();

        res.json({ message: '보고서가 확인되었습니다. 매칭횟수가 +1 되었습니다.' });
    } catch (error) {
        console.error('Error confirming report:', error);
        res.status(500).json({ error: 'Failed to confirm report' });
    }
};
