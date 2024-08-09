//board.js
const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Board = sequelize.define("Board", {
  boardID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: false
  },
  name: {
    type: DataTypes.STRING(20),
    allowNull: false
  }
}, {
  timestamps: false
});

module.exports = Board;