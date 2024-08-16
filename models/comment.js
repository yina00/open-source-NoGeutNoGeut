//comment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Post = require('./post');
const Member = require('./member');

const Comment = sequelize.define('Comment', {
  commentID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  postID: {
    type: DataTypes.INTEGER,
    references: {
      model: Post,
      key: 'postID'
    },
    allowNull: false,
    onDelete: 'CASCADE'
  },
  commentTime: {
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
    references: {
      model: Member,
      key: 'memberNum'
    },
    allowNull: false,
    onDelete: 'CASCADE'
  },
  content: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false,
  tableName: 'Comments'
});

Post.hasMany(Comment, { foreignKey: 'postID' });
Comment.belongsTo(Post, { foreignKey: 'postID' });

Member.hasMany(Comment, { foreignKey: 'memberNum' });
Comment.belongsTo(Member, { foreignKey: 'memberNum' });

Comment.hasMany(Comment, { as: 'Replies', foreignKey: 'parentCommentId' });

module.exports = Comment;