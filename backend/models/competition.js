// models/competition.js

('use strict');
module.exports = (sequelize, DataTypes) => {
	const Competition = sequelize.define(
		'Competition',
		{
			title: DataTypes.STRING,
			date_open: {
				type: DataTypes.DATEONLY, // Sequelize.DATEONLY для хранения без времени
				allowNull: false,
				validate: {
					isDate: true, // Валидация на предмет корректности даты
				},
			},

			date_close: {
				type: DataTypes.DATEONLY, // Sequelize.DATEONLY для хранения без времени
				allowNull: false,
				validate: {
					isDate: true, // Валидация на предмет корректности даты
				},
			},
			location: DataTypes.STRING,
		},
		{}
	);

	Competition.associate = function (models) {
		Competition.hasMany(models.CompetitionsParticipation, {
			foreignKey: 'competitionId',
		});
	};

	return Competition;
};
