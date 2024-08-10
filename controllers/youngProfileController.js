const StudentProfile = require('../models/studentProfile');
const Member = require('../models/member');
const InterestField = require("../models/interestField");
const fs = require('fs').promises;
const Review = require("../models/review");

// Fetch user data
async function fetchData(userID) {
    try {
        return await Member.findOne({ where: { memberNum: userID } });
    } catch (error) {
        console.error("Error fetching member data:", error);
        throw error;
    }
}

// Fetch student profile data
async function fetchStudentProfile(userID) {
    try {
        return await StudentProfile.findOne({ where: { stdNum: userID } });
    } catch (error) {
        console.error("Error fetching student profile:", error);
        throw error;
    }
}

// Fetch interest field data
async function fetchInterestFieldData(userID) {
    try {
        return await InterestField.findAll({ where: { memberNum: userID } });
    } catch (error) {
        console.error("Error fetching interest fields:", error);
        throw error;
    }
}

// Fetch review data
async function fetchReviewData(memberNum) {
    try {
        return await Review.findAll({ where: { reviewReceiver: memberNum } });
    } catch (error) {
        console.error("Error fetching reviews:", error);
        throw error;
    }
}

// Calculate Korean age by year
function calculateKoreanAgeByYear(birthYear) {
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear + 1; // 한국 나이는 출생 연도에 1을 더함
}

// Render profile creation page
exports.createYoungProfile = (req, res) => {
    const user = req.session.user;
    const age = calculateKoreanAgeByYear(user.birthYear); // 세션에서 출생연도를 기반으로 나이 계산
    res.render("CreateProfile_young.ejs", { user, age });
};

// Handle profile creation post request
exports.postcreateYoungProfile = (req, res) => {
    console.log(req.body);
    res.send("프로필이 성공적으로 생성되었습니다.");
};

// Create student profile
exports.createStudentProfile = async (req, res) => {
    try {
        const {
            account,
            birthYear,    // 출생연도
            phoneNumber,
            gender,
            university,
            major,
            sido,
            gugun,
            favoField,
            desiredAmount,
            ableDay,
            ableTime,
            selfIntro,
            active
        } = req.body;
        if (!account) {
            throw new Error('Account is required.');
        }

        const formattedSelfIntro = selfIntro.replace(/\r\n/g, "<br>");
        const profileImagePath = req.file ? req.file.path : null;
        let profileImage = null;

        if (profileImagePath) {
            profileImage = await fs.readFile(profileImagePath);
        }

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

        const desireMapping = {
            'DA_1': '1만원',
            'DA_3': '3만원',
            'DA_5': '5만원',
            'DA_free': '무료',
            'DA_disscu': '협의'
        };

        const yearOfBirth = parseInt(birthYear, 10);
        const age = calculateKoreanAgeByYear(yearOfBirth);  // 출생연도로 나이 계산

        await StudentProfile.create({
            stdNum: req.session.user.memberNum,
            profileImage: profileImage,
            account: account,
            yearOfBirth: yearOfBirth,
            phoneNumber: phoneNumber,
            gender: gender === 'male' ? '남성' : '여성',
            university: university,
            major: major,
            sido: sido,
            gu: gugun,
            desiredAmount: desireMapping[desiredAmount],
            availableDay: ableDayMapping[ableDayString],
            availableTime: ableTimeMapping[ableTime],
            introduce: formattedSelfIntro,
            enableMatching: active === '활성화',
            matchingCount: 0,
            score: 0,
            creationTime: new Date(),
            recentMatchingTime: null
        });

        const favoFields = Array.isArray(favoField) ? favoField : [favoField];
        const fieldMappings = {
            'FF_exercise': '운동',
            'FF_craft': '수공예',
            'FF_digital': '디지털',
            'FF_music': '음악',
            'FF_art': '미술',
            'FF_companion': '말동무'
        };

        for (const field of favoFields) {
            const mappedField = fieldMappings[field];
            if (mappedField) {
                await InterestField.create({
                    memberNum: req.session.user.memberNum,
                    interestField: mappedField
                });
            }
        }

        await Member.update({ profileCreationStatus: true }, { where: { memberNum: req.session.user.memberNum } });
        res.redirect('/main');

    } catch (error) {
        console.error("Error creating student profile:", error);
        res.status(500).send("프로필을 생성하는 중에 오류가 발생했습니다.");
    }
};

// Render modified profile page
exports.modifiedStudentProfile = async (req, res) => {
    try {
        const user = req.session.user;
        const student = await fetchStudentProfile(req.session.user.memberNum);

        if (student) {
            const age = calculateKoreanAgeByYear(student.yearOfBirth);  // 기존 프로필의 출생연도를 사용해 나이 계산
            const interestField = await fetchInterestFieldData(student.stdNum);
            const review = await fetchReviewData(student.stdNum);
            const encodedImageBase64String = student.profileImage ? Buffer.from(student.profileImage).toString('base64') : null;

            res.render('modifiedProfile_young', { student, age, encodedImageBase64String, interests: interestField, review, user });
        } else {
            res.status(404).send("학생 프로필을 찾을 수 없습니다.");
        }

    } catch (error) {
        console.error("Error loading modified profile page:", error);
        res.status(500).send("프로필 수정 페이지를 불러오는 중에 오류가 발생했습니다.");
    }
};

// Update student profile
exports.updateStudentProfile = async (req, res) => {
    const {
        gender,
        account,
        university,
        major,
        phoneNumber,
        sido,
        gugun,
        favoField,
        desiredAmount,
        ableDay,
        ableTime,
        selfIntro,
    } = req.body;

    const userId = req.session.user.memberNum;
    const profileImagePath = req.file ? req.file.path : null;

    try {
        const updates = {};

        // 프로필 이미지 업데이트
        if (profileImagePath) {
            const profileImage = await fs.readFile(profileImagePath);
            updates.profileImage = profileImage;
        }

        // 데이터 매핑
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
        const desireMapping = {
            'DA_1': '1만원',
            'DA_3': '3만원',
            'DA_5': '5만원',
            'DA_free': '무료',
            'DA_disscu': '협의'
        };

        // 프로필 정보 업데이트
        await StudentProfile.update(
            {
                ...updates,
                desiredAmount: desireMapping[desiredAmount],
                introduce: selfIntro.replace(/\r\n/g, "<br>"),
                gender: gender === 'male' ? '남성' : '여성',
                university: university,
                major: major,
                account: account,
                sido: sido,
                gu: gugun,
                availableDay: ableDayMapping[ableDay] || null,
                availableTime: ableTimeMapping[ableTime] || null,
                phoneNumber: phoneNumber
            },
            { where: { stdNum: userId } }
        );

        // 관심 분야 업데이트
        await InterestField.destroy({
            where: { memberNum: userId }
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
        res.status(500).json({ error: "프로필 업데이트 중 오류가 발생했습니다." });
    }
};