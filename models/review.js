const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Matching = require('./matching');
const Member = require('./member');

const Review = sequelize.define('Review', {
  matching_num: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Matching,
      key: 'matching_num',
    },
  },
  review_writer: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Member,
      key: 'member_num',
    },
  },
  review_receiver: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Member,
      key: 'member_num',
    },
  },
  review_content: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
}, {
  tableName: 'review',
  timestamps: false,
  primaryKey: {
    type: 'primary',
    fields: ['matching_num', 'review_receiver'],
  },
});

module.exports = Review;