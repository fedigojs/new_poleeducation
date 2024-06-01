'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.bulkInsert(
			'Roles',
			[
				{ name: 'Admin', createdAt: new Date(), updatedAt: new Date() },
				{ name: 'Coach', createdAt: new Date(), updatedAt: new Date() },
				{ name: 'Judge', createdAt: new Date(), updatedAt: new Date() },
				{
					name: 'Default',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('Roles', null, {});
	},
};
