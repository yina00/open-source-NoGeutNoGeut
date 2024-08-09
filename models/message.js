//message.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Member = require("./member");
const ChatRoom = require("./chatRoom");

const Message = sequelize.define("Message", {
  messageID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  senderNum: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Member,
      key: 'memberNum'
    }
  },
  receiverNum: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Member,
      key: 'memberNum'
    }
  },
  chatRoomNum: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ChatRoom,
      key: 'chatRoomNum'
    }
  },
  sendDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  isChecked: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 0
  },
  messageType: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: "text"
  },
  messageContent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  messageImage: {
    type: DataTypes.BLOB("medium"),
    allowNull: true
  }
}, {
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['senderNum', 'receiverNum', 'sendDate']
    }
  ]
});

module.exports = Message;