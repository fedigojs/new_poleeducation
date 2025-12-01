'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('ProtocolElementResults', 'sessionId', {
			type: Sequelize.STRING(36),
			allowNull: true,
			comment: 'UUID сессии судьи для разделения протоколов при одном userId',
		});

		// Устанавливаем дефолтное значение для существующих записей
		await queryInterface.sequelize.query(
			"UPDATE \"ProtocolElementResults\" SET \"sessionId\" = 'legacy-' || id::text WHERE \"sessionId\" IS NULL"
		);
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('ProtocolElementResults', 'sessionId');
	},
};
