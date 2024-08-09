//post.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Member = require("./member");
const Board = require("./board");

const Post = sequelize.define("Post", {
  postID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  content: {
    type: DataTypes.STRING(1000),
    allowNull: false
  },
  regionName: {
    type: DataTypes.CHAR(6),
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  boardID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Board,
      key: 'boardID'
    }
  },
  memberID: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Member,
      key: 'memberNum'
    }
  }
}, {
  timestamps: false
});

module.exports = Post;