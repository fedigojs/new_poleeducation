'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.bulkInsert(
			'Competitions',
			[
				{
					title: 'Чемпионат по пилонному спорту 2024',
					date_open: '2024-09-01',
					date_close: '2024-09-03',
					location: 'Киев',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('Competitions', null, {});
	},
};
