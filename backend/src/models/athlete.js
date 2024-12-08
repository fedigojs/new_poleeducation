// models/athlete.js

('use strict');
module.exports = (sequelize, DataTypes) => {
	const Athlete = sequelize.define('Athlete', {
		firstName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		coachId: {
			type: DataTypes.INTEGER,
			allowNull: true, // Указывает, что наличие тренера необязательно
			references: {
				model: 'Users',
				key: 'id',
			},
		},
	});

	Athlete.associate = function (models) {
		Athlete.belongsTo(models.User, {
			foreignKey: 'coachId',
			as: 'coach',
		});
		Athlete.hasMany(models.CompetitionsParticipation, {
			foreignKey: 'athleteId',
		});
	};

	return Athlete;
};
