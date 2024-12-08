// models/role.js
'use strict';

module.exports = (sequelize, DataTypes) => {
	const Role = sequelize.define(
		'Role',
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
		},
		{
			tableName: 'Roles',
		}
	);

	Role.associate = function (models) {
		Role.hasMany(models.User, { as: 'users', foreignKey: 'roleId' });
	};

	return Role;
};
