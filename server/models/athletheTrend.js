//models/athleteTrend.js

'use strict';

module.exports = (sequelize, DataTypes) => {
	const AthleteTrend = sequelize.define('AthleteTrend', {
		trends: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	});
	AthleteTrend.associate = function (models) {
		AthleteTrend.hasMany(models.CompetitionsParticipation, {
			foreignKey: 'athleteTrendId',
		});
		AthleteTrend.hasMany(models.ProtocolTrend, {
			foreignKey: 'trendId',
			as: 'protocolTrends',
		});
	};
	return AthleteTrend;
};
