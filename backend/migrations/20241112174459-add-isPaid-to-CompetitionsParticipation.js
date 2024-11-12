'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('CompetitionsParticipations', 'isPaid', {
			type: Sequelize.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		});
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn(
			'CompetitionsParticipations',
			'isPaid'
		);
	},
};
