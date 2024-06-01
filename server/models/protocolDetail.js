//model/protocolDetail.js
'use strict';
module.exports = (sequelize, DataTypes) => {
	const ProtocolDetail = sequelize.define(
		'ProtocolDetail',
		{
			protocolTypeId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: 'ProtocolTypes',
					key: 'id',
				},
			},
			elementName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			maxScore: {
				type: DataTypes.FLOAT,
				allowNull: false,
			},
			comment: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
		},
		{}
	);

	ProtocolDetail.associate = function (models) {
		ProtocolDetail.hasMany(models.ProtocolElementResult, {
			foreignKey: 'protocolDetailId', // Ссылка на ProtocolElementResult
			as: 'details',
		});
		ProtocolDetail.belongsTo(models.ProtocolType, {
			foreignKey: 'protocolTypeId',
			as: 'protocolType',
		});
	};
	return ProtocolDetail;
};
