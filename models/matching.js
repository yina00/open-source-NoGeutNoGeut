const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Promise = require('./promise');
const Report = require('./report');

const Matching = sequelize.define('Matching', {
  matching_num: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  promise_num: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Promise,
      key: 'promise_num',
    },
  },
  report_num: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Report,
      key: 'report_num',
    },
  },
  deposit_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  report_status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
}, {
  tableName: 'matching',
  timestamps: false,
});

module.exports = Matching;