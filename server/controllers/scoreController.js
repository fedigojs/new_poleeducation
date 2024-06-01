// controllers/scoreController.js
'use strict';

const { Score } = require('../models');

// Создание нового балла
exports.createScore = async (req, res) => {
	try {
		const { protocolId, score, criterion } = req.body;
		const newScore = await Score.create({
			protocolId,
			score,
			criterion,
		});
		res.status(201).send(newScore);
	} catch (error) {
		res.status(400).send(error);
	}
};

// Получение списка всех баллов
exports.getAllScores = async (req, res) => {
	try {
		const scores = await Score.findAll();
		res.status(200).send(scores);
	} catch (error) {
		res.status(500).send(error);
	}
};

// Получение балла по идентификатору
exports.getScoreById = async (req, res) => {
	try {
		const { id } = req.params;
		const score = await Score.findByPk(id);
		if (score) {
			res.status(200).send(score);
		} else {
			res.status(404).send({ message: 'Балл не найден' });
		}
	} catch (error) {
		res.status(500).send(error);
	}
};

// Обновление балла
exports.updateScore = async (req, res) => {
	try {
		const { id } = req.params;
		const { protocolId, score, criterion } = req.body;
		const updated = await Score.update(
			{
				protocolId,
				score,
				criterion,
			},
			{
				where: { id },
			}
		);

		if (updated[0] > 0) {
			const updatedScore = await Score.findByPk(id);
			res.status(200).send(updatedScore);
		} else {
			res.status(404).send({ message: 'Балл не найден' });
		}
	} catch (error) {
		res.status(500).send(error);
	}
};

// Удаление балла
exports.deleteScore = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await Score.destroy({ where: { id } });
		if (deleted) {
			res.status(200).send({ message: 'Балл удален' });
		} else {
			res.status(404).send({ message: 'Балл не найден' });
		}
	} catch (error) {
		res.status(500).send(error);
	}
};
