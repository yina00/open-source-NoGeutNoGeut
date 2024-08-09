const Keep = require("../models/keep");
const SeniorProfile = require("../models/seniorProfile");
const StudentProfile = require("../models/studentProfile");
const Member = require("../models/member");

module.exports = {
  index: async (req, res, next) => {
    try {
      const user = req.user;
      console.log('Logged in user:', user);

      if (!user) {
        return res.redirect("/login");
      }

      if (user.userType !== 'senior') {
        return res.render("keep", {
          message: "노인 회원만 찜할 수 있습니다.",
          categories: []
        });
      }

      const sortBy = req.query.sortBy || "newest";
      let order;

      if (sortBy === "newest") {
        order = [["keepTime", "DESC"]];
      } else if (sortBy === "oldest") {
        order = [["keepTime", "ASC"]];
      }

      console.log('Order:', order);

      const keeps = await Keep.findAll({
        where: { seniorNum: user.memberNum },
        order: order
      });

      console.log('Keeps:', keeps);

      const profiles = [];

      for (const keep of keeps) {
        console.log('Processing keep:', keep);
        let profile = await StudentProfile.findOne({
          where: { stdNum: keep.stdNum },
          include: [{ model: Member, attributes: ['name'] }]
        });

        if (profile) {
          profile = profile.toJSON();
          profile.keepTime = keep.keepTime; 
          if (profile.profileImage) {
            profile.encodedImageBase64String = Buffer.from(profile.profileImage).toString('base64');
          } else {
            profile.encodedImageBase64String = '';
          }
          profiles.push(profile);
        }
      }

      console.log('Profiles to render:', profiles);

      res.render("keep", {
        categories: profiles,
        sortBy: sortBy,
        message: null
      });
    } catch (error) {
      console.log(`Error fetching keeps: ${error.message}`);
      next(error);
    }
  },

  removeKeep: async (req, res) => {
    try {
      const seniorNum = req.user.memberNum;
      const { stdNum } = req.body;

      await Keep.destroy({
        where: {
          seniorNum,
          stdNum
        }
      });

      res.status(200).json({ message: '찜 취소하기 성공' });
    } catch (error) {
      console.error(`Error removing from keep list: ${error.message}`);
      res.status(500).json({ message: '서버 오류' });
    }
  },

  addKeep: async (req, res) => {
    try {
      const seniorNum = req.user.memberNum;
      const { stdNum } = req.body;

      const newKeep = await Keep.create({
        seniorNum,
        stdNum,
        keepTime: new Date()
      });

      res.status(200).json({ message: '찜하기 성공', keep: newKeep });
    } catch (error) {
      console.error(`Error adding to keep list: ${error.message}`);
      res.status(500).json({ message: '서버 오류' });
    }
  }
};
