const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Promise = require('./promise');

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
      model: 'Members',
      key: 'memberNum'
    }
  },
  receiverNum: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'Members',
      key: 'memberNum'
    }
  },
  roomNum: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'ChatRooms',
      key: 'roomNum'
    }
  },
  sendDay: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  check: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  promiseNum: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Promises',
      key: 'promiseNum'
    },
    onUpdate: 'CASCADE'
  }, readStatus: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['senderNum', 'receiverNum', 'sendDay']
    }
  ]
});


// 관계 설정
Message.belongsTo(Promise, { foreignKey: 'promiseNum' });
Promise.hasMany(Message, { foreignKey: 'promiseNum' });


module.exports = Message;