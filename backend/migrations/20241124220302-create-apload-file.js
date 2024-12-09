'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('UploadedFiles', {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			competitionParticipationId: {
				type: Sequelize.INTEGER,
				allowNull: false,
				references: {
					model: 'CompetitionsParticipations',
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE',
			},
			fileName: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			filePath: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.fn('NOW'),
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.fn('NOW'),
			},
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('UploadedFiles');
	},
};
