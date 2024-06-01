// models/protocolTrend.js

'use strict';

module.exports = (sequelize, DataTypes) => {
	const ProtocolTrend = sequelize.define('ProtocolTrend', {
		trendId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'AthleteTrends',
				key: 'id',
			},
		},
		protocolTypeId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'ProtocolTypes',
				key: 'id',
			},
		},
	});

	ProtocolTrend.associate = function (models) {
		ProtocolTrend.belongsTo(models.AthleteTrend, {
			foreignKey: 'trendId',
			as: 'athleteTrend',
		});
		ProtocolTrend.belongsTo(models.ProtocolType, {
			foreignKey: 'protocolTypeId',
			as: 'protocolType',
		});
	};

	return ProtocolTrend;
};
