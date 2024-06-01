'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.bulkInsert(
			'Disciplines',
			[
				{ name: 'Пилон', createdAt: new Date(), updatedAt: new Date() },
				{
					name: 'Кольцо',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					name: 'Полотна',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.bulkDelete('Levels', null, {});
	},
};
