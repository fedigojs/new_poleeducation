// controllers/levelController.js
'use strict';

const { Level } = require('../models');

// Создание нового уровня мастерства
exports.createLevel = async (req, res) => {
	try {
		const { name } = req.body;
		const newLevel = await Level.create({ name });
		res.status(201).send(newLevel);
	} catch (error) {
		res.status(400).send(error);
	}
};

// Получение списка всех уровней мастерства
exports.getAllLevels = async (req, res) => {
	try {
		const levels = await Level.findAll();
		res.status(200).send(levels);
	} catch (error) {
		res.status(500).send(error);
	}
};
