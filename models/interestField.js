const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Member = require('./member');

const InterestField = sequelize.define('InterestField', {
  member_num: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Member,
      key: 'member_num',
    },
  },
  interest_field: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
}, {
  tableName: 'interestField',
  timestamps: false,
  primaryKey: {
    type: 'primary',
    fields: ['member_num', 'interest_field'],
  },
});

module.exports = InterestField;