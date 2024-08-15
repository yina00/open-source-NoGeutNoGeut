'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Members', 'age', {
      type: Sequelize.INTEGER,
      allowNull: true,  // 'age' 필드를 NULL 허용으로 설정
    });

    await queryInterface.changeColumn('Members', 'userType', {
      type: Sequelize.STRING,
      allowNull: true,  // 'userType' 필드를 NULL 허용으로 설정
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Members', 'age', {
      type: Sequelize.INTEGER,
      allowNull: false,  // 'age' 필드를 NULL 비허용으로 설정
    });

    await queryInterface.changeColumn('Members', 'userType', {
      type: Sequelize.STRING,
      allowNull: false,  // 'userType' 필드를 NULL 비허용으로 설정
    });
  }
};

