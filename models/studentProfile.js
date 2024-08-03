const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Member = require('./member');

const StudentProfile = sequelize.define('StudentProfile', {
  member_num: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    references: {
      model: Member,
      key: 'member_num',
    },
  },
  profile_picture: {
    type: DataTypes.BLOB('medium'),
  },
  univ_certification: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  major: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  grade: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  univ_name: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  activation_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING(2),
    allowNull: false,
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  desired_amount: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  self_intro: {
    type: DataTypes.TEXT,
  },
  matching_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  profile_creation_time: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  last_matching_time: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  birth_year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1940,
      max: 2024,
    },
  },
  sido: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  gu: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  day: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
}, {
  tableName: 'studentProfile',
  timestamps: false,
});

module.exports = StudentProfile;