// models/user.js
'use strict';

module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define(
		'User',
		{
			firstName: DataTypes.STRING,
			lastName: DataTypes.STRING,
			phoneNumber: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			email: {
				type: DataTypes.STRING,
				unique: true,
			},
			password: DataTypes.STRING, // Для аутентификации
			roleId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			tableName: 'Users',
		}
	);

	User.associate = function (models) {
		// Ассоциации
		User.belongsTo(models.Role, { foreignKey: 'roleId' });
		User.hasMany(models.Athlete, {
			foreignKey: 'coachId', // Указываем внешний ключ для связи
			as: 'athletes', // Указываем псевдоним для доступа к атлетам через экземпляр тренера
		});
		User.hasMany(models.ProtocolElementResult, {
			foreignKey: 'judgeId',
			as: 'protocols', // Протоколы, заполненные судьей
		});
	};

	return User;
};
