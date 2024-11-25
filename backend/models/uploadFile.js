//uploadFile.js model
'use strict';

module.exports = (sequelize, DataTypes) => {
	const UploadFile = sequelize.define('UploadFile', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		competitionParticipationId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: 'CompetitionsParticipation',
				key: 'id',
			},
		},
		fileName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		filePath: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		createdAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	});

	UploadFile.associate = function (models) {
		UploadFile.belongsTo(models.CompetitionsParticipation, {
			foreignKey: 'competitionParticipationId',
			as: 'competitionParticipation',
		});
	};
	return UploadFile;
};
