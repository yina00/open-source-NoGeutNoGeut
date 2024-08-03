const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const BulletinBoard = require('./bulletinBoard');
const Member = require('./member');

const Post = sequelize.define('Post', {
  post_num: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  post_content: {
    type: DataTypes.STRING(1000),
    allowNull: false,
  },
  region_name: {
    type: DataTypes.CHAR(6),
    allowNull: false,
  },
  post_create_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  bulletinboard_num: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: BulletinBoard,
      key: 'bulletinboard_num',
    },
  },
  member_num: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Member,
      key: 'member_num',
    },
  },
}, {
  tableName: 'post',
  timestamps: false,
});

module.exports = Post;