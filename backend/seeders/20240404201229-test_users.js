'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.bulkInsert(
			'Users',
			[
				{
					firstName: 'Admin',
					lastName: 'User',
					email: 'fedigo.sj@gmail.com',
					password: bcrypt.hashSync('123', 10), // Хеширование пароля для безопасности
					roleId: 1, // ID для роли Admin
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					firstName: 'Coach',
					lastName: 'User',
					email: 'coach@example.com',
					password: bcrypt.hashSync('123', 10), // Хеширование пароля
					roleId: 2, // ID для роли Coach
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					firstName: 'Judge',
					lastName: 'User',
					email: 'judge@example.com',
					password: bcrypt.hashSync('123', 10), // Хеширование пароля
					roleId: 3, // ID для роли Judge
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					firstName: 'Test',
					lastName: 'User',
					email: 'test@example.com',
					password: bcrypt.hashSync('123', 10), // Хеширование пароля
					roleId: 4, // ID для роли Test
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('Users', null, {});
	},
};
