'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.bulkInsert(
			'AthleteTrends',
			[
				{
					trends: 'Pole Sport (пілон спорт)',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trends: 'Pole Art (пілон артістік)',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trends: 'Hoop Sport (кільце спорт)',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trends: 'Hoop Art (кільце артістік)',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trends: 'Silk Sport (полотна спорт)',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trends: 'Silk Art (полотна артістік)',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trends: 'Original Genre (орігінальний жанр)',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trends: 'Hammock Art',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('AthleteTrends', null, {});
	},
};
