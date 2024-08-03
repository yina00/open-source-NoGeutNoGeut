const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Member = require('./member');

const SeniorProfile = sequelize.define('SeniorProfile', {
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
  desired_amount: {
    type: DataTypes.STRING(10),
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
  caution: {
    type: DataTypes.TEXT,
  },
  self_intro: {
    type: DataTypes.TEXT,
  },
  senior_phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  senior_name: {
    type: DataTypes.STRING(10),
    allowNull: false,
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
  tableName: 'seniorProfile',
  timestamps: false,
});

module.exports = SeniorProfile;