// controllers/protocolDetailController.js
'use strict';

const { ProtocolDetail, ProtocolType } = require('../models');

// Получение списка всех деталей протоколов
exports.getAllProtocolDetails = async (req, res) => {
	try {
		const protocolDetails = await ProtocolDetail.findAll({});
		res.status(200).send(protocolDetails);
	} catch (error) {
		res.status(500).send(error);
	}
};

exports.getProtocolDetailById = async (req, res) => {
	const { protocolTypeId } = req.params;

	try {
		const protocols = await ProtocolDetail.findAll({
			where: { protocolTypeId: protocolTypeId },
			include: [
				{
					model: ProtocolType,
					as: 'protocolType',
				},
			],
		});

		if (!protocols.length) {
			return res.status(404).send('Протоколы не найдены');
		}

		res.status(200).send(protocols);
	} catch (error) {
		console.error('Ошибка при получении данных протоколов:', error);
		res.status(500).send('Ошибка сервера');
	}
};
