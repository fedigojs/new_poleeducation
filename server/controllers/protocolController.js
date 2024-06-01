// controllers/protocolController.js
'use strict';

const { Protocol } = require('../models');

// Создание нового протокола
exports.createProtocol = async (req, res) => {
	try {
		const {
			competitionParticipationId,
			type,
			competitionId,
			athleteId,
			categoryId,
			finalScore,
		} = req.body;

		const newProtocol = await Protocol.create({
			competitionParticipationId,
			type,
			competitionId,
			athleteId,
			categoryId,
			finalScore,
		});

		res.status(201).send(newProtocol);
	} catch (error) {
		res.status(400).send(error);
	}
};

// Получение списка всех протоколов
exports.getAllProtocols = async (req, res) => {
	try {
		const protocols = await Protocol.findAll({
			include: ['scores'],
		});
		res.status(200).send(protocols);
	} catch (error) {
		res.status(500).send(error);
	}
};

// Получение протокола по идентификатору
exports.getProtocolById = async (req, res) => {
	try {
		const { id } = req.params;
		const protocol = await Protocol.findByPk(id, {
			include: ['scores'],
		});
		if (protocol) {
			res.status(200).send(protocol);
		} else {
			res.status(404).send({ message: 'Протокол не найден' });
		}
	} catch (error) {
		res.status(500).send(error);
	}
};

// Обновление протокола
exports.updateProtocol = async (req, res) => {
	try {
		const { id } = req.params;
		const {
			competitionParticipationId,
			type,
			competitionId,
			athleteId,
			categoryId,
			finalScore,
		} = req.body;

		const updated = await Protocol.update(
			{
				competitionParticipationId,
				type,
				competitionId,
				athleteId,
				categoryId,
				finalScore,
			},
			{
				where: { id },
			}
		);

		if (updated[0] > 0) {
			const updatedProtocol = await Protocol.findByPk(id, {
				include: ['scores'],
			});
			res.status(200).send(updatedProtocol);
		} else {
			res.status(404).send({ message: 'Протокол не найден' });
		}
	} catch (error) {
		res.status(500).send(error);
	}
};

// Удаление протокола
exports.deleteProtocol = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await Protocol.destroy({ where: { id } });
		if (deleted) {
			res.status(200).send({ message: 'Протокол удален' });
		} else {
			res.status(404).send({ message: 'Протокол не найден' });
		}
	} catch (error) {
		res.status(500).send(error);
	}
};
