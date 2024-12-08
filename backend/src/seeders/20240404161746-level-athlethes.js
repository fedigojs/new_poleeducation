'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert(
			'Levels',
			[
				{ name: 'Дебют', createdAt: new Date(), updatedAt: new Date() },
				{
					name: 'Аматор',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					name: 'Полупрофи',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{ name: 'Профи', createdAt: new Date(), updatedAt: new Date() },
				{ name: 'Элит', createdAt: new Date(), updatedAt: new Date() },
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete('Levels', null, {});
	},
};
