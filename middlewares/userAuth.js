const Member = require("../models/member");
const StudentProfile = require("../models/studentProfile");
const SeniorProfile = require("../models/seniorProfile");

module.exports = async (req, res, next) => {
  if (req.isAuthenticated()) {
    const user = await Member.findByPk(req.user.memberNum);

    if (user) {
      const studentProfile = await StudentProfile.findOne({ where: { stdNum: user.memberNum } });
      const seniorProfile = await SeniorProfile.findOne({ where: { seniorNum: user.memberNum } });

      req.user.isStudent = !!studentProfile;
      req.user.isSenior = !!seniorProfile;
    }
  }
  next();
};
