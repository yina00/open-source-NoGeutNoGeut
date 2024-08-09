'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('SeniorProfiles', 'scoreTotal', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('StudentProfiles', 'scoreTotal', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('SeniorProfiles', 'scoreTotal');
    await queryInterface.removeColumn('StudentProfiles', 'scoreTotal');
  }
};
