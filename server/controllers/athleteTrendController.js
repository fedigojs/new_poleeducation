//controllers/athleteTrendController.js
'use strict';

const { AthleteTrend, ProtocolTrend, ProtocolType } = require('../models');

exports.createAthleteTrend = async (req, res) => {
	try {
		const { age } = req.body;
		const newAthleteTrend = await AthleteTrend.create({ age });
		res.status(200).send(newAthleteTrend);
	} catch (error) {
		res.status(400).send(error);
	}
};

exports.getAllAthleteTrend = async (req, res) => {
	try {
		const trends = await AthleteTrend.findAll();
		res.status(200).send(trends);
	} catch (error) {
		res.status(500).send(error);
	}
};

exports.getTrendWithProtocols = async (req, res) => {
	try {
		const { trendId } = req.params;
		const trendWithProtocols = await AthleteTrend.findOne({
			where: { id: trendId },
			include: [
				{
					model: ProtocolTrend,
					as: 'protocolTrends',
					include: [
						{
							// Добавляем вложенное включение для ProtocolType
							model: ProtocolType,
							as: 'protocolType',
						},
					],
				},
			],
		});

		if (!trendWithProtocols) {
			return res.status(404).send({ message: 'Направление не найдено' });
		}

		res.status(200).send(trendWithProtocols);
	} catch (error) {
		res.status(500).send({
			message:
				'Ошибка при получении данных направления: ' + error.message,
		});
	}
};
