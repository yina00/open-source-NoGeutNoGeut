const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const StudentProfile = require('./studentProfile');

const ChatRoom = sequelize.define('ChatRoom', {
  chat_room_num: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  student_num: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: StudentProfile,
      key: 'member_num',
    },
  },
  guardian_num: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: StudentProfile,
      key: 'member_num',
    },
  },
  create_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  last_message: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
}, {
  tableName: 'chatRoom',
  timestamps: false,
});

module.exports = ChatRoom;