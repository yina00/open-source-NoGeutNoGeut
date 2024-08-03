const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Member = require('./member');
const ChatRoom = require('./chatRoom');

const Promise = sequelize.define('Promise', {
  promise_num: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
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
  chat_room_num: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ChatRoom,
      key: 'chat_room_num',
    },
  },
  promise_create_time: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  promise_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  finish_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  texting_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
}, {
  tableName: 'promise',
  timestamps: false,
});

module.exports = Promise;