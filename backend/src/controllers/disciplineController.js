// controllers/disciplineController.js
'use strict';

const { Discipline } = require('../models');

// Создание новой дисциплины
exports.createDiscipline = async (req, res) => {
	try {
		const { name } = req.body;
		const newDiscipline = await Discipline.create({ name });
		res.status(201).send(newDiscipline);
	} catch (error) {
		res.status(400).send(error);
	}
};

// Получение списка всех дисциплин
exports.getAllDisciplines = async (req, res) => {
	try {
		const disciplines = await Discipline.findAll();
		res.status(200).send(disciplines);
	} catch (error) {
		res.status(500).send(error);
	}
};

// Получение дисциплины по идентификатору
exports.getDisciplineById = async (req, res) => {
	try {
		const { id } = req.params;
		const discipline = await Discipline.findByPk(id);
		if (discipline) {
			res.status(200).send(discipline);
		} else {
			res.status(404).send({ message: 'Дисциплина не найдена' });
		}
	} catch (error) {
		res.status(500).send(error);
	}
};

// Обновление дисциплины
exports.updateDiscipline = async (req, res) => {
	try {
		const { id } = req.params;
		const { name } = req.body;
		const updated = await Discipline.update(
			{ name },
			{
				where: { id },
			}
		);

		if (updated[0] > 0) {
			const updatedDiscipline = await Discipline.findByPk(id);
			res.status(200).send(updatedDiscipline);
		} else {
			res.status(404).send({ message: 'Дисциплина не найдена' });
		}
	} catch (error) {
		res.status(500).send(error);
	}
};

// Удаление дисциплины
exports.deleteDiscipline = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await Discipline.destroy({
			where: { id },
		});
		if (deleted) {
			res.status(200).send({ message: 'Дисциплина удалена' });
		} else {
			res.status(404).send({ message: 'Дисциплина не найдена' });
		}
	} catch (error) {
		res.status(500).send(error);
	}
};
