const SeniorProfile = require("../models/seniorProfile");
const StudentProfile = require("../models/studentProfile");
const InterestField = require("../models/interestField");
const Member = require("../models/member");
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

function calculateKoreanAgeByYear(birthYear) {
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
}

exports.modified = async (req, res) => {
    const user = await fetchData(req.session.userID);
    const senior = await fetchData2(req.session.userID);
    const student = await fetchData3(req.session.userID);
    if (senior) {
        const year = await calculateKoreanAgeByYear(senior.yearOfBirth);
        const interestField = await interestFieldData(senior.seniorNum);
        const encodedImageBase64String = Buffer.from(senior.profileImage).toString('base64');
        res.render('modifiedProfile_old', { senior, age: year, encodedImageBase64String: encodedImageBase64String, interests: interestField, user: user });
    }
    else if (student) {
        console.log(student.introduce);
        const year = await calculateKoreanAgeByYear(student.yearOfBirth);
        console.log(year);
        const interestField = await interestFieldData(student.stdNum);
        console.log(interestField);
        const encodedImageBase64String = Buffer.from(student.profileImage).toString('base64');
        res.render('modifiedProfile_young', { student, age: year, encodedImageBase64String: encodedImageBase64String, interests: interestField, user: user });
    }

}