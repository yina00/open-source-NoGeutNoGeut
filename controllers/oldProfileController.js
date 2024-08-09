const SeniorProfile = require('../models/seniorProfile');
const Member = require('../models/member');
const Sequelize = require('sequelize');
const InterestField = require("../models/interestField");
const fs = require('fs').promises;
const Review = require("../models/review");

async function fetchData(userID) {
    try {
        const users = await Member.findOne({ where: { memberNum: userID } });
        return users;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/** 
exports.detailedOldProfile = (req, res) => {
    const user = fetchData(req.session.userID);
    res.render("DetailedProfile_old.ejs", { user: user });
};
*/
exports.createOldProfile = async (req, res) => {
    //const user = await fetchData(req.session.user.memberID);
    const user = req.session.user;
    res.render("CreateProfile_old.ejs", { user: user });
};


exports.postcreateOldProfile = (req, res) => {
    console.log(req.body);
    res.send("프로필이 성공적으로 생성되었습니다.");
};


exports.createSeniorProfile = async (req, res) => {
    try {
        console.log(req.body);
        const {
            name,
            birthYear,
            phoneNumber,
            gender,
            sido,
            gugun,
            favoField,
            desiredAmount,
            ableDay,
            ableTime,
            selfIntro,
            caution,
            active
        } = req.body;

        const formatSelfIntro = selfIntro.replace(/\r\n/g, "<br>");
        const formatCaution = caution.replace(/\r\n/g, "<br>");
        console.log("req.file 생성");
        console.log(req.file);
        const profileImagePath = req.file ? req.file.path : null;
        let profileImage = null;

        // 이미지 파일을 읽어 BLOB 데이터로 변환
        if (profileImagePath) {
            profileImage = await fs.readFile(profileImagePath);
        }

        console.log(profileImage);
        const ableDayString = Array.isArray(ableDay) ? ableDay.join(',') : ableDay;

        const ableDayMapping = {
            'ableDay_1': '월',
            'ableDay_2': '화',
            'ableDay_3': '수',
            'ableDay_4': '목',
            'ableDay_5': '금',
            'ableDay_6': '토',
            'ableDay_7': '일'
        };
        const ableTimeMapping = {
            'ableTime_noon': '오후',
            'ableTime_morn': '오전',
            'ableTime_disscu': '협의'
        };

        const DesireMapping = {
            'DA_1': '1만원',
            'DA_3': '3만원',
            'DA_5': '5만원',
            'DA_free': '무료',
            'DA_disscu': '협의'
        };
        const seniorProfile = await SeniorProfile.create({
            seniorNum: req.session.user.memberNum,
            profileImage: profileImage,
            desiredAmount: DesireMapping[desiredAmount],
            enableMatching: active === '활성화',
            gender: gender === 'male' ? '남성' : '여성',
            precautions: formatCaution,
            introduce: formatSelfIntro,
            seniorName: name,
            seniorPhoneNumber: phoneNumber,
            matchingCount: 0,
            creationTime: new Date(),
            recentMatchingTime: null,
            yearOfBirth: birthYear,
            sido: sido,
            gu: gugun,
            availableDay: ableDayMapping[ableDayString],
            availableTime: ableTimeMapping[ableTime],
            score: 0,
            recentMatchingTime: null
        });


        const fieldMappings = {
            'FF_exercise': '운동',
            'FF_craft': '수공예',
            'FF_digital': '디지털',
            'FF_music': '음악',
            'FF_art': '미술',
            'FF_companion': '말동무'
        };
        const favoFields = Array.isArray(favoField) ? favoField : [favoField];
        for (const field of favoFields) {
            const mappedField = fieldMappings[field];
            if (mappedField) {
                await InterestField.create({
                    memberNum: req.session.userID,
                    interestField: mappedField
                });
            }
        }
        const user = await fetchData(req.session.userID);
        if (user) {
            await Member.update({
                profileCreationStatus: true
            }, {
                where: { memberNum: req.session.userID }
            }).then((result) => {
                console.log("수정 성공: ", result);
            }).catch((err) => {
                console.log("수정 Error: ", err);
            });
        }

        console.log("Senior profile created:", seniorProfile);
        res.redirect('/main');
    } catch (error) {
        console.error("Error creating senior profile:", error);
        res.status(500).send("프로필을 생성하는 중에 오류가 발생했습니다.");
    }
};
async function fetchData2(userID) {
    try {
        const senior = await SeniorProfile.findOne({ where: { seniorNum: userID } });
        if (senior) {
            console.log("있다있어!!!!!!!!!!!!!!");
        } else {
            console.log("없어!!!!!!!");
        }
        return senior;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


async function interestFieldData(seniorID) {
    try {
        const interests = await InterestField.findAll({
            where: { memberNum: seniorID },
            attributes: ['interestField']
        });

        const interestFields = interests.map(interest => interest.interestField);

        if (interestFields.length > 0) {
            console.log("있다있어!!!!!!!!!!!!!!");
        } else {
            console.log("없어!!!!!!!");
        }

        return interestFields;
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

exports.modifiedSeniorProfile = async (req, res) => {
    try {

        //const user = await fetchData(req.session.userID);
        const user = req.session.user;
        const senior = await fetchData2(req.session.userID);
        //const senior = await fetchData2(req.session.user.memberNum);
        if (senior) {
            const year = await calculateKoreanAgeByYear(senior.yearOfBirth);
            const interestField = await interestFieldData(senior.seniorNum);

            const review = await reviewData(senior.seniorNum);
            const encodedImageBase64String = Buffer.from(senior.profileImage).toString('base64');
            res.render('modifiedProfile_old', { senior, age: year, encodedImageBase64String: encodedImageBase64String, interests: interestField, review: review, user: user });
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
}

const sequelize = require('../config/database');

exports.updateSeniorProfile = async (req, res) => {
    console.log(req.body);
    const {
        name,
        birthYear,
        phoneNumber,
        gender,
        sido,
        gugun,
        favoField,
        desiredAmount,
        ableDay,
        ableTime,
        selfIntro,
        caution,
    } = req.body;

    const formatSelfIntro = selfIntro.replace(/\r\n/g, "<br>");
    const formatCaution = caution.replace(/\r\n/g, "<br>");

    const profileImagePath = req.file ? req.file.path : null;
    if (req.file) {
        console.log("이미지가 있습니다.");
    } else {
        console.log("이미지경로가 없습니다");
    }
    let profileImage = null;

    
    if (profileImagePath) {
        profileImage = await fs.readFile(profileImagePath);
    }

    const ableDayMapping = {
        'ableDay_1': '월',
        'ableDay_2': '화',
        'ableDay_3': '수',
        'ableDay_4': '목',
        'ableDay_5': '금',
        'ableDay_6': '토',
        'ableDay_7': '일'
    };
    const ableTimeMapping = {
        'ableTime_noon': '오후',
        'ableTime_morn': '오전',
        'ableTime_disscu': '협의'
    };

    const DesireMapping = {
        'DA_1': '1만원',
        'DA_3': '3만원',
        'DA_5': '5만원',
        'DA_free': '무료',
        'DA_disccu': '협의'
    };

    try {
        const userId = req.session.userID;
        await SeniorProfile.update(
            { seniorName: name },
            {
                where: {
                    seniorNum: userId,
                },
            },
        );
        await SeniorProfile.update(
            { desiredAmount: DesireMapping[desiredAmount] },
            {
                where: {
                    seniorNum: userId,
                },
            },
        );
        if (req.file) {
            const profileImage = await fs.readFile(req.file.path);
            await SeniorProfile.update(
                { profileImage: profileImage },
                {
                    where: {
                        seniorNum: userId,
                    },
                },
            );
            console.log("이미지가 있습니다.");
        } else {
            console.log("이미지 경로가 없습니다");
        }
        await SeniorProfile.update(
            { precautions: formatCaution },
            {
                where: {
                    seniorNum: userId,
                },
            },
        );
        await SeniorProfile.update(
            { introduce: formatSelfIntro },
            {
                where: {
                    seniorNum: userId,
                },
            },
        );
        await SeniorProfile.update(
            { yearOfBirth: birthYear },
            {
                where: {
                    seniorNum: userId,
                },
            },
        );
        await SeniorProfile.update(
            { sido: sido },
            {
                where: {
                    seniorNum: userId,
                },
            },
        );
        await SeniorProfile.update(
            { gu: gugun },
            {
                where: {
                    seniorNum: userId,
                },
            },
        );
        await SeniorProfile.update(
            { availableDay: ableDayMapping[ableDay] },
            {
                where: {
                    seniorNum: userId,
                },
            },
        );
        await SeniorProfile.update(
            { availableTime: ableTimeMapping[ableTime] },
            {
                where: {
                    seniorNum: userId,
                },
            },
        );
        await SeniorProfile.update(
            { seniorPhoneNumber: phoneNumber },
            {
                where: {
                    seniorNum: userId,
                },
            },
        );
        await SeniorProfile.update(
            { gender: gender === 'male' ? '남성' : '여성' },
            {
                where: {
                    seniorNum: userId,
                },
            },
        );
        await InterestField.destroy({
            where: {
                memberNum: userId,
            },
        });
        const fieldMappings = {
            'FF_exercise': '운동',
            'FF_craft': '수공예',
            'FF_digital': '디지털',
            'FF_music': '음악',
            'FF_art': '미술',
            'FF_companion': '말동무'
        };
        const favoFields = Array.isArray(favoField) ? favoField : [favoField];
        for (const field of favoFields) {
            const mappedField = fieldMappings[field];
            if (mappedField) {
                await InterestField.create({
                    memberNum: userId,
                    interestField: mappedField
                });
            }
        }

        res.redirect("/main");

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: "An error occurred while updating the profile" });
    }
};