// models/level.js

'use strict';

module.exports = (sequelize, DataTypes) => {
	const Level = sequelize.define(
		'Level',
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			tableName: 'Levels', // Явное указание имени таблицы
		}
	);
	Level.associate = function (models) {
		Level.hasMany(models.Exercise, {
			foreignKey: 'levelId', // Указываем внешний ключ, по которому будет установлена связь
			as: 'exercises', // Устанавливаем алиас для связи
		});
	};

	return Level;
};
