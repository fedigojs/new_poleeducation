'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.bulkInsert(
			'ProtocolTrends',
			[
				{
					trendId: 1,
					protocolTypeId: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 1,
					protocolTypeId: 4,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 1,
					protocolTypeId: 5,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 1,
					protocolTypeId: 7,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 1,
					protocolTypeId: 8,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 3,
					protocolTypeId: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 3,
					protocolTypeId: 4,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 3,
					protocolTypeId: 5,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 3,
					protocolTypeId: 7,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 3,
					protocolTypeId: 8,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 5,
					protocolTypeId: 1,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 5,
					protocolTypeId: 4,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 5,
					protocolTypeId: 5,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 5,
					protocolTypeId: 7,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 5,
					protocolTypeId: 8,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 2,
					protocolTypeId: 6,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 2,
					protocolTypeId: 8,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 4,
					protocolTypeId: 6,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 4,
					protocolTypeId: 8,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 6,
					protocolTypeId: 6,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				{
					trendId: 6,
					protocolTypeId: 8,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			],
			{}
		);
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.bulkDelete('ProtocolTrends', null, {});
	},
};
