// models/protocolType.js

'use strict';

module.exports = (sequelize, DataTypes) => {
	const ProtocolType = sequelize.define('ProtocolType', {
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});
	ProtocolType.associate = function (models) {
		ProtocolType.hasMany(models.ProtocolTrend, {
			foreignKey: 'protocolTypeId',
			as: 'protocolTrends',
		});
	};

	return ProtocolType;
};
