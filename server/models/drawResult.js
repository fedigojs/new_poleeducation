// models/drawResult.js
'use strict';

module.exports = (sequelize, DataTypes) => {
	const DrawResult = sequelize.define('DrawResult', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		competitionParticipationId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'CompetitionsParticipations',
				key: 'id',
			},
		},
		competitionId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'Competitions',
				key: 'id',
			},
		},
		performanceOrder: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		athleteTrendId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'AthleteTrends',
				key: 'id',
			},
		},
		athleteAgeId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'AthleteAges',
				key: 'id',
			},
		},
		levelId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'Levels',
				key: 'id',
			},
		},
		timing: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		competitionDay: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		totalscore: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
	});

	DrawResult.associate = function (models) {
		DrawResult.belongsTo(models.CompetitionsParticipation, {
			foreignKey: 'competitionParticipationId',
			as: 'participation',
		});
		DrawResult.belongsTo(models.AthleteTrend, {
			foreignKey: 'athleteTrendId',
			as: 'athleteTrend',
		});
		DrawResult.belongsTo(models.AthleteAge, {
			foreignKey: 'athleteAgeId',
			as: 'athleteAge',
		});
		DrawResult.belongsTo(models.Level, {
			foreignKey: 'levelId',
			as: 'level',
		});
		DrawResult.belongsTo(models.Competition, {
			foreignKey: 'competitionId',
			as: 'competition',
		});
	};

	return DrawResult;
};
