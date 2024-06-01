// models/competitionParticipation.js

'use strict';
module.exports = (sequelize, DataTypes) => {
	const CompetitionsParticipation = sequelize.define(
		'CompetitionsParticipation',
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
			},
			athleteId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			competitionId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			athleteTrendId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			athleteAgeId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			levelId: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			disciplineId: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: 'Disciplines',
					key: 'id',
				},
			},
		},
		{
			indexes: [
				{
					unique: true,
					fields: ['athleteId', 'competitionId', 'athleteTrendId'], // Составной уникальный индекс
				},
			],
		}
	);
	CompetitionsParticipation.associate = function (models) {
		CompetitionsParticipation.belongsTo(models.Competition, {
			foreignKey: 'competitionId',
		});
		CompetitionsParticipation.belongsTo(models.Athlete, {
			foreignKey: 'athleteId',
		});
		CompetitionsParticipation.belongsTo(models.AthleteAge, {
			foreignKey: 'athleteAgeId',
		});
		CompetitionsParticipation.belongsTo(models.AthleteTrend, {
			foreignKey: 'athleteTrendId',
		});
		CompetitionsParticipation.belongsTo(models.Level, {
			foreignKey: 'levelId',
		});
		CompetitionsParticipation.belongsTo(models.Discipline, {
			foreignKey: 'disciplineId',
			as: 'discipline', // Убедитесь, что этот псевдоним совпадает с тем, что используется в запросах
		});
		// Множественная связь с упражнениями через промежуточную таблицу
		CompetitionsParticipation.belongsToMany(models.Exercise, {
			through: 'DetailExercises',
			foreignKey: 'competitionParticipationId',
			otherKey: 'exerciseId',
			as: 'exercises',
		});
		CompetitionsParticipation.hasMany(models.DrawResult, {
			foreignKey: 'competitionParticipationId',
			as: 'drawResults', // Это псевдоним, который вы будете использовать для доступа к данным
		});
	};
	return CompetitionsParticipation;
};
