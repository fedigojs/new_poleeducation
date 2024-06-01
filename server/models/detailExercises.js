// models/detailExercises.js

module.exports = (sequelize, DataTypes) => {
	const DetailExercises = sequelize.define('DetailExercises', {
		competitionParticipationId: {
			type: DataTypes.INTEGER,
			references: {
				model: 'CompetitionsParticipation',
				key: 'id',
			},
		},
		exerciseId: {
			type: DataTypes.INTEGER,
			references: {
				model: 'Exercise',
				key: 'id',
			},
		},
	});

	DetailExercises.associate = function (models) {
		DetailExercises.belongsTo(models.Exercise, {
			foreignKey: 'exerciseId',
			as: 'exercise',
		});
	};

	return DetailExercises;
};
