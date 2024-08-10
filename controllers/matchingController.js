const { Sequelize, Op } = require('sequelize');
const sequelize = require('../config/database');
const Matching = require('../models/matching');
const Report = require('../models/report');
const Review = require('../models/review');
const StudentProfile = require('../models/studentProfile');
const SeniorProfile = require('../models/seniorProfile');

module.exports = {
  completeMatching: async (req, res) => {
    const matchingNum = req.body.matchingNum;
    const t = await sequelize.transaction();

    try {
      //매칭 정보를 가져옵니다.
      const matching = await Matching.findByPk(matchingNum, { transaction: t });
      if (!matching) {
        throw new Error('Matching not found');
      }

      //보고서가 작성되었고, 입금 및 확인이 완료되었는지 확인합니다.
      if (!matching.reportStatus || !matching.depositStatus) {
        throw new Error('Report or deposit not completed');
      }

      //리뷰가 작성되었는지 확인합니다.
      const review = await Review.findOne({
        where: { matchingNum },
        transaction: t
      });
      if (!review) {
        throw new Error('Review not completed');
      }

      //매칭 횟수를 증가시키고, 최근 매칭 시간을 업데이트합니다.
      await StudentProfile.update(
        {
          matchingCount: Sequelize.literal('matchingCount + 1'),
          recentMatchingTime: new Date()
        },
        {
          where: { stdNum: matching.stdNum },
          transaction: t
        }
      );

      await SeniorProfile.update(
        {
          matchingCount: Sequelize.literal('matchingCount + 1'),
          recentMatchingTime: new Date()
        },
        {
          where: { seniorNum: matching.seniorNum },
          transaction: t
        }
      );

      //트랜잭션 커밋
      await t.commit();

      res.status(200).send('Matching completed successfully');
    } catch (error) {
      //트랜잭션 롤백
      await t.rollback();
      console.error(error);
      res.status(500).send('Error completing matching');
    }
  }
};
