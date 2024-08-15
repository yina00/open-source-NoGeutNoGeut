const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Board = require('./board');
const Member = require('./member');

const Post = sequelize.define('Post', {
  postID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  content: {
    type: DataTypes.STRING(1000),
    allowNull: false
  },
  region: {
    type: DataTypes.CHAR(8),
    allowNull: false
  },
  creationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  boardID: {
    type: DataTypes.INTEGER,
    references: {
      model: Board,
      key: 'boardID'
    },
    allowNull: false,
    onDelete: 'CASCADE'
  },
  memberNum: {
    type: DataTypes.BIGINT,
    references: {
      model: Member,
      key: 'memberNum'
    },
    allowNull: false,
    onDelete: 'CASCADE'
  }
}, {
  timestamps: false,
  tableName: 'Posts'
});

Board.hasMany(Post, { foreignKey: 'boardID' });
Post.belongsTo(Board, { foreignKey: 'boardID' });

Member.hasMany(Post, { foreignKey: 'memberNum' });
Post.belongsTo(Member, { foreignKey: 'memberNum' });

module.exports = Post;