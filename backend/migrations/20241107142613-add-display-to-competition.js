'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('Competitions', 'display', {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('Competitions', 'display');
	},
};
