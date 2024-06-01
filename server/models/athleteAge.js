//models/athleteAge.js

'use strict';

module.exports = (sequelize, DataTypes) => {
	const AthleteAge = sequelize.define('AthleteAge', {
		age: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});
	AthleteAge.associate = function (models) {
		AthleteAge.hasMany(models.CompetitionsParticipation, {
			foreignKey: 'athleteAgeId',
		});
	};
	return AthleteAge;
};
