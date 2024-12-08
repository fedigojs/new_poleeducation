'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.bulkInsert(
			'ProtocolTypes',
			[
				{
					name: 'Протокол оценки технической сложности Pole Sport',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					name: 'Протокол оценки технической сложности Aerial Hoop',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					name: 'Протокол оценки технической сложности Aerial Silk',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					name: 'Протокол оценки чистоты выполнения, штрафы',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					name: 'Протокол оценки артистической и хореографической постановки',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					name: 'Протокол оценки АРТ',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					name: 'Протокол обязательных элементов',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					name: 'Протокол главного судьи',
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('ProtocolTypes', null, {});
	},
};
