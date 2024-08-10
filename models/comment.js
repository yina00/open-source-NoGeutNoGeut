//comment.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Member = require("./member");
const Post = require("./post");

const Comment = sequelize.define("Comment", {
  commentID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  postID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Post,
      key: 'postID'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  parentCommentID: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  memberNum: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Member,
      key: 'memberNum'
    }
  },
  content: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  timestamps: false
});

module.exports = Comment;