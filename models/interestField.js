const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Member = require("./member");

const InterestField = sequelize.define("InterestField", {
  memberNum: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    references: {
      model: Member,
      key: "memberNum"
    }
  },
  interestField: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    allowNull: false
  }
});

module.exports = InterestField;
