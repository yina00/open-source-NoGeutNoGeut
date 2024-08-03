const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BulletinBoard = sequelize.define('BulletinBoard', {
  bulletinboard_num: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  bulletinboard_name: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
}, {
  tableName: 'bulletinBoard',
  timestamps: false,
});

module.exports = BulletinBoard;