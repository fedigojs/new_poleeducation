'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.bulkInsert(
			'AthleteAges',
			[
				{
					age: '5 - 6 років',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					age: '7 - 9 років',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					age: '10 - 11 років',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					age: '12 - 14 років',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					age: '15 - 17 років',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					age: '18 - 25 років',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					age: '18 - 25 років',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					age: 'Дорослі 25+',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					age: 'Групи',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					age: 'Дует юніори',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					age: 'Дует діти',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					age: 'Дует дорослі',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('AthleteAges', null, {});
	},
};
