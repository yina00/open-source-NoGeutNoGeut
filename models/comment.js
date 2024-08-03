const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Member = require('./member');
const Post = require('./post');

const Comment = sequelize.define('Comment', {
  post_num: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Post,
      key: 'post_num',
    },
  },
  commentID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  writing_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  affiliation_comment_num: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  member_num: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Member,
      key: 'member_num',
    },
  },
  comment_content: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
}, {
  tableName: 'comment',
  timestamps: false,
});

module.exports = Comment;