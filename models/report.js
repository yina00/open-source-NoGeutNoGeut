const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const SeniorProfile = require("./seniorProfile");
const StudentProfile = require("./studentProfile");
const Member = require("./member");

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
  }
}, {
  timestamps: true //createdAt、 updatedAt 자동으로 추가하고 관리하는 거
});

Report.belongsTo(Member, { as: 'student', foreignKey: 'stdNum' });
Report.belongsTo(Member, { as: 'seniorMember', foreignKey: 'seniorNum' });
Report.belongsTo(SeniorProfile, { as: 'senior', foreignKey: 'seniorNum' });
Report.belongsTo(StudentProfile, { as: 'studentProfile', foreignKey: 'stdNum' });
Report.belongsTo(SeniorProfile, { as: 'seniorProfile', foreignKey: 'seniorNum' });

Member.hasMany(Report, { foreignKey: 'stdNum' });
SeniorProfile.hasMany(Report, { foreignKey: 'seniorNum' });

module.exports = Report;
