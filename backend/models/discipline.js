// models/discipline.js

'use strict';

module.exports = (sequelize, DataTypes) => {
	const Discipline = sequelize.define(
		'Discipline',
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false, // Предполагаем, что название дисциплины обязательно к заполнению
			},
		},
		{
			tableName: 'Disciplines', // Явное указание имени таблицы
		}
	);

	Discipline.associate = function (models) {
		// Ассоциация один ко многим с моделью Exercise
		Discipline.hasMany(models.Exercise, {
			foreignKey: 'disciplineId',
			as: 'exercises',
		});
	};

	return Discipline;
};
