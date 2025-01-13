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
			foreignKey: 'coachId',
			as: 'athletes',
		});
		User.hasMany(models.ProtocolElementResult, {
			foreignKey: 'judgeId',
			as: 'protocols',
		});
	};

	return User;
};
