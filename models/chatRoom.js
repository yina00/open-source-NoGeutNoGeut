// chatRoom.js
const { DataTypes } = require('sequelize');
const sequelize = require("../config/database");
const StudentProfile = require("./studentProfile");
const SeniorProfile = require("./seniorProfile");

const ChatRoom = sequelize.define('ChatRoom', {
  roomNum: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  roomName: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  stdNum: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: StudentProfile,
      key: 'stdNum'
    },
    onDelete: 'CASCADE'
  },
  protectorNum: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: SeniorProfile,
      key: 'seniorNum'
    },
    onDelete: 'CASCADE'
  },
  roomCreationTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  lastMessageContent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lastMessageTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastMessageID: {
    type: DataTypes.BIGINT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'ChatRoom',
  timestamps: false
});

StudentProfile.hasMany(ChatRoom, { foreignKey: 'stdNum' });
ChatRoom.belongsTo(StudentProfile, { foreignKey: 'stdNum' });

SeniorProfile.hasMany(ChatRoom, { foreignKey: 'protectorNum' });
ChatRoom.belongsTo(SeniorProfile, { foreignKey: 'protectorNum' });

module.exports = ChatRoom;
