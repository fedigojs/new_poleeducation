// models/exercise.js

'use strict';

module.exports = (sequelize, DataTypes) => {
	const Exercise = sequelize.define(
		'Exercise',
		{
			code: {
				type: DataTypes.STRING,
				allowNull: false, // Предполагается, что имя упражнения обязательно
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false, // Предполагается, что имя упражнения обязательно
			},
			descriptions: {
				type: DataTypes.STRING(1000),
				allowNull: true, // Описание упражнения может быть необязательным
			},
			image: {
				type: DataTypes.STRING,
				allowNull: true, // Ссылка на изображение упражнения может быть необязательной
			},
			disciplineId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'Disciplines', // Указываем имя модели, к которой относится внешний ключ
					key: 'id',
				},
			},
			levelId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'Levels', // Указываем имя модели, к которой относится внешний ключ
					key: 'id',
				},
			},
		},
		{
			tableName: 'Exercises', // Явное указание имени таблицы
		}
	);

	Exercise.associate = function (models) {
		// Устанавливаем связь "многие к одному" с моделью Discipline
		Exercise.belongsTo(models.Discipline, {
			foreignKey: 'disciplineId',
			as: 'discipline',
		});
		Exercise.belongsTo(models.Level, {
			foreignKey: 'levelId', // Указываем внешний ключ, по которому будет установлена связь
			as: 'level', // Устанавливаем алиас для связи
		});

		Exercise.belongsToMany(models.CompetitionsParticipation, {
			through: 'DetailExercises',
			foreignKey: 'exerciseId',
			otherKey: 'competitionParticipationId',
			as: 'participation',
		});
		Exercise.hasMany(models.DetailExercises, {
			foreignKey: 'exerciseId',
			as: 'detailExercises',
		});
	};

	return Exercise;
};
