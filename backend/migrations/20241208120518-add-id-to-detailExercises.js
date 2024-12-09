'use strict';

module.exports = {
	up: async (queryInterface, Sequelize) => {
		return queryInterface.addColumn('DetailExercises', 'id', {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true,
			allowNull: false,
		});
	},

	down: async (queryInterface, Sequelize) => {
		return queryInterface.removeColumn('DetailExercises', 'id');
	},
};
