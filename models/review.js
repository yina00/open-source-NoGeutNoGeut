const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Review = sequelize.define("Review", {
  matchingNum: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  reviewSender: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  reviewReceiver: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false
  },
  reviewContent: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
});

module.exports = Review;
