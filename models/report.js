const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const SeniorProfile = require("./seniorProfile");
const StudentProfile = require("./studentProfile");
const Member = require("./member");
const Promise = require("./promise");  // Promise 모델을 가져옵니다.
const Matching = require("./matching")

const Report = sequelize.define("Report", {
  reportNum: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  reportContent: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  reportMedia: {
    type: DataTypes.BLOB("medium"),
    allowNull: false
  },
  seniorNum: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  stdNum: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  reportStatus: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  promiseNum: {  // 이 부분을 추가
    type: DataTypes.INTEGER,
    references: {
      model: Promise, // 참조하는 모델
      key: 'promiseNum' // 참조하는 컬럼
    }
  }
}, {
  timestamps: true // createdAt, updatedAt 자동 추가
});

Report.belongsTo(Member, { as: 'student', foreignKey: 'stdNum' });
Report.belongsTo(Member, { as: 'seniorMember', foreignKey: 'seniorNum' });
Report.belongsTo(SeniorProfile, { as: 'senior', foreignKey: 'seniorNum' });
Report.belongsTo(StudentProfile, { as: 'studentProfile', foreignKey: 'stdNum' });
Report.belongsTo(SeniorProfile, { as: 'seniorProfile', foreignKey: 'seniorNum' });
Report.belongsTo(Promise, { foreignKey: 'promiseNum' }); // 이 부분도 추가

Member.hasMany(Report, { foreignKey: 'stdNum' });
SeniorProfile.hasMany(Report, { foreignKey: 'seniorNum' });
Matching.belongsTo(Report, { foreignKey: 'reportNum', targetKey: 'reportNum' });
Report.hasOne(Matching, { foreignKey: 'reportNum', sourceKey: 'reportNum' });

module.exports = Report;
