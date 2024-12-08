// models/competition.js

('use strict');
module.exports = (sequelize, DataTypes) => {
	const Competition = sequelize.define(
		'Competition',
		{
			title: DataTypes.STRING,
			date_open: {
				type: DataTypes.DATEONLY,
				allowNull: false,
				validate: {
					isDate: true,
				},
			},

			date_close: {
				type: DataTypes.DATEONLY,
				allowNull: false,
				validate: {
					isDate: true,
				},
			},
			location: DataTypes.STRING,
			display: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
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
