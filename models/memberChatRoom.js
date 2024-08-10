const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MemberChatRoom = sequelize.define('MemberChatRoom', {
  memberNum: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  roomNum: {
    type: DataTypes.BIGINT,
    allowNull: false
  }
}, {
  timestamps: false
});

module.exports = MemberChatRoom;
