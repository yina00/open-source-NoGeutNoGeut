const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Member = require("./member");

const StudentProfile = sequelize.define("StudentProfile", {
  stdNum: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    references: {
      model: Member,
      key: "memberNum"
    }
  },
  profileImage: {
    type: DataTypes.BLOB("medium")
  },
  major: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  score: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  university: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  enableMatching: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  gender: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  desiredAmount: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  introduce: {
    type: DataTypes.TEXT
  },
  matchingCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  creationTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  recentMatchingTime: {
    type: DataTypes.DATE,
    allowNull: true   
  },
  yearOfBirth: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1940,
      max: 2024
    }
  },
  sido: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  gu: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  availableDay: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  availableTime: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  account: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  score: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  scoreCount: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  scoreTotal: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  indexes: [
    { fields: ['score'] },  //별점에 대한 인덱스
    { fields: ['matchingCount'] },  //매칭 횟수에 대한 인덱스
    { fields: ['recentMatchingTime'] },  //최근 매칭 시간에 대한 인덱스
    { fields: ['creationTime'] },  //생성 시간에 대한 인덱스
    { fields: ['desiredAmount'] },  //희망 금액에 대한 인덱스
    { fields: ['sido', 'gu'] }  //지역 정보 (시도와 구)에 대한 복합 인덱스
  ]
});

module.exports = StudentProfile;
