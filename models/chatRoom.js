const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class ChatRoom extends Model {}

ChatRoom.init({
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
    allowNull: false
  },
  protectorNum: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  roomCreationTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'ChatRoom',
  timestamps: false
});

module.exports = ChatRoom;
