'use strict';

module.exports = (sequelize, DataTypes) => {
	const ProtocolElementResult = sequelize.define('ProtocolElementResult', {
		competitionParticipationId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'CompetitionsParticipations',
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
		protocolDetailId: {
			// Переименовано для ясности
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'ProtocolDetails',
				key: 'id',
			},
		},
		score: {
			type: DataTypes.FLOAT,
			defaultValue: 0,
		},
		comment: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		judgeId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'Users',
				key: 'id',
			},
		},
		sessionDate: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		athleteId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'Athletes',
				key: 'id',
			},
		},
		sessionId: {
			type: DataTypes.STRING(36),
			allowNull: true,
			comment: 'UUID сессии судьи для разделения протоколов при одном userId',
		},
	});

	ProtocolElementResult.associate = function (models) {
		ProtocolElementResult.belongsTo(models.CompetitionsParticipation, {
			foreignKey: 'competitionParticipationId',
			as: 'participation',
		});
		ProtocolElementResult.belongsTo(models.ProtocolDetail, {
			foreignKey: 'protocolDetailId', // Обновлено с учетом переименования
			as: 'detail',
		});
		ProtocolElementResult.belongsTo(models.ProtocolType, {
			foreignKey: 'protocolTypeId',
			as: 'type',
		});
		ProtocolElementResult.belongsTo(models.User, {
			foreignKey: 'judgeId',
			as: 'judge',
		});
		ProtocolElementResult.belongsTo(models.Athlete, {
			foreignKey: 'athleteId',
			as: 'athlete',
		});
	};

	return ProtocolElementResult;
};
