const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Member = require('./member');

const Pick = sequelize.define('Pick', {
  student_num: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Member,
      key: 'member_num',
    },
  },
  guardian_num: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Member,
      key: 'member_num',
    },
  },
  pick_create_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'pick',
  timestamps: false,
  primaryKey: {
    type: 'primary',
    fields: ['student_num', 'guardian_num'],
  },
});

module.exports = Pick;