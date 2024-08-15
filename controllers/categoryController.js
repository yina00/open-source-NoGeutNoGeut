const { Op, Sequelize } = require("sequelize");
const SeniorProfile = require("../models/seniorProfile");
const StudentProfile = require("../models/studentProfile");
const Member = require("../models/member");

//정렬옵션
const sortOptions = {
  rating: ["score", "DESC"], //별점순
  matchingCount: ["matchingCount", "DESC"], //매칭횟수순
  recentMatching: ["recentMatchingTime", "DESC"], //최근매칭순
  recentJoin: ["creationTime", "DESC"], //최근가입순
  lowPrice: [Sequelize.literal("CASE WHEN desiredAmount = '무료' THEN 0 ELSE CAST(desiredAmount AS UNSIGNED) END"), "ASC"], //낮은가격순
  highPrice: [Sequelize.literal("CASE WHEN desiredAmount = '무료' THEN 0 ELSE CAST(desiredAmount AS UNSIGNED) END"), "DESC"] //높은가겨순
};

//시간차이계산함수
function getTimeDifference(date) {
  const now = new Date(); //현재시간
  const past = new Date(date); //과거시간 주어진날짜
  const diffMs = now - past; //밀리초단위로계산
  const diffMins = Math.floor(diffMs / 60000); //분
  const diffHours = Math.floor(diffMins / 60); //시
  const diffDays = Math.floor(diffHours / 24); //일
  const diffMonths = Math.floor(diffDays / 30); //월

  if (diffDays > 180) return "6개월";
  if (diffMonths > 0) return diffMonths + "개월";
  if (diffDays > 0) return diffDays + "일";
  if (diffHours > 0) return diffHours + "시간";
  return diffMins + "분";
}

module.exports = {
  //프로필목록페이지
  index: async (req, res, next) => {
    try {
      const { region, city, gender, amount, day, time, sortBy } = req.query; //필터 및 정렬 옵션 가져오기
      const order = sortOptions[sortBy] || sortOptions.rating; //정렬옵션 설정
      const filterConditions = {}; //필터 조건 개겣

      //필터 조건 설정
      if (region) filterConditions.sido = region;
      if (city) filterConditions.gu = city;
      if (gender && gender !== "전체") filterConditions.gender = gender === "남성" ? "남성" : "여성";
      if (amount) filterConditions.desiredAmount = { [Op.lte]: amount };
      if (day) filterConditions.availableDay = day;
      if (time) filterConditions.availableTime = time;

      console.log('Filter conditions:', filterConditions);

      let profiles = [];
      const user = req.user;

      //유저타입에 따른 프로필 검색
      if (user.userType === 'student') {
        profiles = await SeniorProfile.findAll({
          where: filterConditions,
          include: [{
            model: Member,
            attributes: ['name'],
            required: false //left join을 함
          }],
          order: [order]
        });
      } else if (user.userType === 'senior') {
        profiles = await StudentProfile.findAll({
          where: filterConditions,
          include: [{
            model: Member,
            attributes: ['name'],
            required: false
          }],
          order: [order]
        });
      } else {
        return res.redirect("/main");
      }

      //시간 차이 계싼 및 이미지 인코딩
      profiles = profiles.map(profile => {
        profile = profile.toJSON();
        profile.recentMatchingTimeDifference = getTimeDifference(profile.recentMatchingTime);
        profile.creationTimeDifference = getTimeDifference(profile.creationTime);
        if (profile.profileImage) {
          profile.encodedImageBase64String = Buffer.from(profile.profileImage).toString('base64');
        } else {
          profile.encodedImageBase64String = '';
        }
        return profile;
      });

      console.log('Profiles:', profiles);

      res.render("category", {
        categories: profiles,
        isSenior: user.userType === 'senior',
        isStudent: user.userType === 'student',
        sortBy: sortBy || 'rating'
      });
    } catch (error) {
      console.log(`Error filtering profiles: ${error.message}`);
      next(error);
    }
  },

  //프로파ㅣㅣㄹ 상세 페이지
  show: async (req, res, next) => {
    try {
      const id = req.params.id;
      const user = req.user;
      let profile = null;
      let isSenior = false;
      let isStudent = false;

      //유저타입에 따른 프로필 검색
      if (user.userType === 'student') {
        profile = await SeniorProfile.findOne({
          where: { seniorNum: id },
          include: [{
            model: Member,
            attributes: ['name']
          }]
        });
        isSenior = true;
      } else if (user.userType === 'senior') {
        profile = await StudentProfile.findOne({
          where: { stdNum: id },
          include: [{
            model: Member,
            attributes: ['name']
          }]
        });
        isStudent = true;
      } else {
        return res.redirect("/main");
      }

      if (profile) {
        profile = profile.toJSON();
        profile.recentMatchingTimeDifference = getTimeDifference(profile.recentMatchingTime);
        profile.creationTimeDifference = getTimeDifference(profile.creationTime);
        if (profile.profileImage) {
          profile.encodedImageBase64String = Buffer.from(profile.profileImage).toString('base64');
        } else {
          profile.encodedImageBase64String = '';
        }
      }

      res.render("detailedProfile", {
        profile: profile,
        isSenior: isSenior,
        isStudent: isStudent,
        user: user
      });
    } catch (error) {
      console.log(`Error fetching profile details: ${error.message}`);
      next(error);
    }
  },

  //새로운 카테고리 생성 페이지
  new: (req, res) => {
    res.render('categories/new');
  },

  //카테고리 생성
  create: async (req, res, next) => {
    try {
      const category = await Category.create(req.body);
      res.locals.redirect = `/categories/${category.id}`;
      next();
    } catch (error) {
      console.log(`Error creating category: ${error.message}`);
      next(error);
    }
  },

  //카테고리 상세 페이지 렌더
  showView: (req, res) => {
    res.render('categories/show');
  },

  //카테고리 수정페이지
  edit: async (req, res, next) => {
    try {
      const category = await Category.findByPk(req.params.id);
      res.render('categories/edit', { category });
    } catch (error) {
      console.log(`Error fetching category: ${error.message}`);
      next(error);
    }
  },

  //카테고리업데이트
  update: async (req, res, next) => {
    try {
      await Category.update(req.body, {
        where: { id: req.params.id }
      });
      res.locals.redirect = `/categories/${req.params.id}`;
      next();
    } catch (error) {
      console.log(`Error updating category: ${error.message}`);
      next(error);
    }
  },

  //카테고리 삭제
  delete: async (req, res, next) => {
    try {
      await Category.destroy({
        where: { id: req.params.id }
      });
      res.locals.redirect = "/categories";
      next();
    } catch (error) {
      console.log(`Error deleting category: ${error.message}`);
      next(error);
    }
  },

  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  }
};