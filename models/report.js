const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  report_num: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  report_content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  photo: {
    type: DataTypes.BLOB('medium'),
    allowNull: false,
  },
}, {
  tableName: 'report',
  timestamps: false,
});

module.exports = Report;