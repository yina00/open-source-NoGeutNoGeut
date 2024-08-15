const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Promise = require('./promise');

const Matching = sequelize.define("Matching", {
  matchingNum: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true
  },
  promiseNum: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reportNum: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  depositStatus: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  reportStatus: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

Promise.hasMany(Matching, { foreignKey: 'promiseNum' });
Matching.belongsTo(Promise, { foreignKey: 'promiseNum' });

module.exports = Matching;
