//uploadedFile.js model
'use strict';

module.exports = (sequelize, DataTypes) => {
	const UploadedFile = sequelize.define(
		'UploadedFile',
		{
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
		},
		{
			tableName: 'UploadedFiles',
		}
	);

	UploadedFile.associate = function (models) {
		UploadedFile.belongsTo(models.CompetitionsParticipation, {
			foreignKey: 'competitionParticipationId',
			as: 'competitionParticipation',
		});
	};
	return UploadedFile;
};
