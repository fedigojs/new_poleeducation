// controllers/exerciseController.js
'use strict';

const { Exercise, Discipline, Level } = require('../models');

// Создание нового упражнения
exports.createExercise = async (req, res) => {
	try {
		const { name, descriptions, image, disciplineId, levelId } = req.body;
		const newExercise = await Exercise.create({
			name,
			descriptions,
			image,
			disciplineId,
			levelId,
		});
		res.status(201).send(newExercise);
	} catch (error) {
		res.status(400).send(error);
	}
};

// Получение списка всех упражнений
exports.getAllExercises = async (req, res) => {
	try {
		const exercises = await Exercise.findAll({
			include: [
				{ model: Discipline, as: 'discipline' },
				{ model: Level, as: 'level' },
			],
		});
		res.status(200).send(exercises);
	} catch (error) {
		res.status(500).send(error);
	}
};

// Получение упражнения по идентификатору
exports.getExerciseById = async (req, res) => {
	try {
		const { id } = req.params;
		const exercise = await Exercise.findByPk(id, {
			include: ['discipline', 'level'],
		});
		if (exercise) {
			res.status(200).send(exercise);
		} else {
			res.status(404).send({ message: 'Упражнение не найдено' });
		}
	} catch (error) {
		res.status(500).send(error);
	}
};

// Обновление упражнения
exports.updateExercise = async (req, res) => {
	try {
		const { id } = req.params;
		const exercise = await Exercise.findByPk(id);
		if (!exercise) {
			return res.status(404).send({ message: 'Упражнение не найдено' });
		}
		const { name, descriptions, image, disciplineId, levelId } = req.body;
		await Exercise.update(
			{ name, descriptions, image, disciplineId, levelId },
			{ where: { id } }
		);

		const updatedExercise = await Exercise.findByPk(id, {
			include: ['discipline', 'level'],
		});

		res.status(200).send(updatedExercise);
	} catch (error) {
		res.status(500).send({ message: 'Внутренняя ошибка сервера' });
		console.error(error); // Логирование для внутреннего использования
	}
};

// Удаление упражнения
exports.deleteExercise = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await Exercise.destroy({ where: { id } });
		if (deleted) {
			res.status(200).send({ message: 'Упражнение удалено' });
		} else {
			res.status(404).send({ message: 'Упражнение не найдено' });
		}
	} catch (error) {
		res.status(500).send(error);
	}
};
