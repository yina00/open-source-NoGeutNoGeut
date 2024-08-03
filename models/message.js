const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Member = require('./member');
const ChatRoom = require('./chatRoom');

const Message = sequelize.define('Message', {
  sender_num: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Member,
      key: 'member_num',
    },
  },
  receiver_num: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Member,
      key: 'member_num',
    },
  },
  sending_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  check_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  chat_room_num: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ChatRoom,
      key: 'chat_room_num',
    },
  },
  message_num: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  message_content: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
}, {
  tableName: 'message',
  timestamps: false,
});

module.exports = Message;