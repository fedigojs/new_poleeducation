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
			isPaid: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
				allowNull: false,
			},
		},
		{
			indexes: [
				{
					unique: true,
					fields: ['athleteId', 'competitionId', 'athleteTrendId'],
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
			as: 'discipline',
		});

		CompetitionsParticipation.belongsToMany(models.Exercise, {
			through: 'DetailExercises',
			foreignKey: 'competitionParticipationId',
			otherKey: 'exerciseId',
			as: 'exercises',
		});
		CompetitionsParticipation.hasMany(models.DrawResult, {
			foreignKey: 'competitionParticipationId',
			as: 'drawResults',
		});
		CompetitionsParticipation.hasMany(models.UploadedFile, {
			foreignKey: 'competitionParticipationId',
			as: 'uploadedFiles',
		});
	};
	return CompetitionsParticipation;
};
