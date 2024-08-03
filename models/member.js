const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // 데이터베이스 설정 파일

const Member = sequelize.define('Member', {
  member_num: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
  },
  memberID: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  complaint_num: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'member',
  timestamps: false,
});

module.exports = Member;