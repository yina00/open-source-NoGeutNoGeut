const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Keep = sequelize.define("Keep", {
  stdNum: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  seniorNum: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  keepTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Keep;
