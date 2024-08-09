const { Op } = require("sequelize");
const SeniorProfile = require("../models/seniorProfile");
const StudentProfile = require("../models/studentProfile");

const sortOptions = {
  rating: ["score", "DESC"],
  matchingCount: ["matchingCount", "DESC"],
  recentMatching: ["recentMatchingTime", "DESC"],
  recentJoin: ["creationTime", "DESC"],
  lowPrice: [["desiredAmount", "ASC"], ["desiredAmount", "0"]],
  highPrice: [["desiredAmount", "DESC"], ["desiredAmount", "0"]]
};


module.exports = {
  renderFilter: async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.redirect("/login");
      }

      const user = req.user; //로그인된 사용자 정보를 세션에서 가져옴
      const userType = user.userType;

      res.render("filter", {
        userType,
        currentUser: user
      });
    } catch (error) {
      console.log(`Error rendering filter: ${error.message}`);
      next(error);
    }
  },

  filterProfiles: async (req, res, next) => {
    try {
      const { region, city, gender, amount, day, time, sortBy } = req.body;
      const order = sortOptions[sortBy] || sortOptions.rating;
      const filterConditions = {};

      if (region) filterConditions.sido = region;
      if (city) filterConditions.gu = city;
      if (gender && gender !== "전체") filterConditions.gender = gender === "남성" ? "남성" : "여성";
      if (amount) filterConditions.desiredAmount = { [Op.lte]: amount }; // 원하는 금액 이하로 필터링
      if (day) filterConditions.availableDay = day;
      if (time) filterConditions.availableTime = time;

      console.log('Filter conditions:', filterConditions); //필터 조건 로그 출력

      let profiles = [];
      const user = req.user; //로그인된 사용자 정보를 세션에서 가져옴

      if (user.userType === 'student') {
        profiles = await SeniorProfile.findAll({
          where: filterConditions,
          order: [order]
        });
      } else if (user.userType === 'senior') {
        profiles = await StudentProfile.findAll({
          where: filterConditions,
          order: [order]
        });
      } else {
        return res.redirect("/main");
      }

      console.log('Profiles:', profiles); //필터링된 프로필 로그 출력
      console.log('Profiles to be sent to template:', profiles);
      res.render("category", {
        categories: profiles,
        isSenior: user.userType === 'senior',
        isStudent: user.userType === 'student',
        sortBy
      });
    } catch (error) {
      console.log(`Error filtering profiles: ${error.message}`);
      next(error);
    }
  }
};
