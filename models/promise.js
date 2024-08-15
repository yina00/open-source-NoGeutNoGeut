const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Promise = sequelize.define("Promise", {
  promiseNum: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  stdNum: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  protectorNum: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  roomNum: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  promiseCreationDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  promiseDay: {
    type: DataTypes.DATE,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  finishTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  textSendingStatus: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  promiseSender: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  promiseTitle: {
    type: DataTypes.STRING(20),
    allowNull: false
  }

});

module.exports = Promise;