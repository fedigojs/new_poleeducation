'use strict';

module.exports = (sequelize, DataTypes) => {
	const ProtocolExerciseResult = sequelize.define(
		'ProtocolExerciseResult',
		{
			competitionParticipationId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'CompetitionsParticipations',
					key: 'id',
				},
			},
			exerciseId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'Exercises',
					key: 'id',
				},
			},
			result: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0, // 0 - не выполнено, 1 - выполнено
			},
			judgeId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'Users',
					key: 'id',
				},
			},
			sessionDate: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			athleteId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'Athletes',
					key: 'id',
				},
			},
		},
		{
			indexes: [
				{
					unique: true,
					fields: [
						'competitionParticipationId',
						'exerciseId',
						'judgeId',
					],
				},
			],
		}
	);

	ProtocolExerciseResult.associate = function (models) {
		ProtocolExerciseResult.belongsTo(models.CompetitionsParticipation, {
			foreignKey: 'competitionParticipationId',
			as: 'participation',
		});
		ProtocolExerciseResult.belongsTo(models.Exercise, {
			foreignKey: 'exerciseId',
			as: 'exercise',
		});
		ProtocolExerciseResult.belongsTo(models.User, {
			foreignKey: 'judgeId',
			as: 'judge',
		});
		ProtocolExerciseResult.belongsTo(models.Athlete, {
			foreignKey: 'athleteId',
			as: 'athlete',
		});
	};

	return ProtocolExerciseResult;
};
