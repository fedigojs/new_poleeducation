'use strict';

module.exports = (sequelize, DataTypes) => {
	const TotalCompetitionResults = sequelize.define(
		'TotalCompetitionResults',
		{
			competitionParticipationId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'CompetitionsParticipations',
					key: 'id',
				},
				unique: true, // Убедитесь, что запись уникальна для каждого участия
			},
			totalScore: {
				type: DataTypes.FLOAT,
				allowNull: false,
				defaultValue: 0.0, // Общий счет
			},
			additionalMetrics: DataTypes.JSON, // Для хранения дополнительных данных, если необходимо
			// Вы можете добавить другие поля, например, для хранения количества судей, оценивших участие, или другой статистики
		}
	);

	TotalCompetitionResults.associate = function (models) {
		TotalCompetitionResults.belongsTo(models.CompetitionsParticipation, {
			foreignKey: 'competitionParticipationId',
			as: 'participation',
		});
		// Другие возможные ассоциации
	};

	return TotalCompetitionResults;
};
