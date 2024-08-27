//controllers/athleteController.js
const {
	authenticate,
	authorizeRoles,
} = require('../src/middleware/authenticate');
const { User, Athlete } = require('../models');

// Создание атлета
exports.createAthlete = async (req, res) => {
	const { firstName, lastName, levelId, coachId } = req.body;
	try {
		const athlete = await Athlete.create({
			firstName,
			lastName,
			coachId,
		});
		return res.status(201).json(athlete);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

exports.getAthletes = async (req, res) => {
	try {
		let athletes;
		athletes = await Athlete.findAll({
			include: [
				{
					model: User,
					as: 'coach',
					attributes: ['id', 'firstName', 'lastName'],
				}, // Убедитесь, что тренеры связаны как 'coach' в вашей модели Athlete
			],
		});

		return res.status(200).json(athletes);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

exports.getAthletesByCoach = async (req, res) => {
	try {
		const { userId } = req.params; // Получаем userId из параметров маршрута

		if (!userId) {
			return res.status(400).json({
				message: 'UserId is required',
			});
		}

		const athletes = await Athlete.findAll({
			where: { coachId: userId }, // Фильтрация по coachId
		});

		return res.status(200).json(athletes);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

// Получение атлета по ID
exports.getAthleteById = async (req, res) => {
	const { id } = req.params;
	try {
		const athlete = await Athlete.findByPk(id, {
			include: [{ model: User, as: 'coach' }],
		});
		if (!athlete) {
			return res.status(404).json({ error: 'Athlete not found' });
		}
		return res.status(200).json(athlete);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

// Обновление атлета
exports.updateAthlete = async (req, res) => {
	const { id } = req.params;
	const { firstName, lastName, levelId, coachId } = req.body;
	try {
		const athlete = await Athlete.findByPk(id);
		if (!athlete) {
			return res.status(404).json({ error: 'Athlete not found' });
		}
		await athlete.update({ firstName, lastName, levelId, coachId });
		return res.status(200).json(athlete);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

// Удаление атлета
exports.deleteAthlete = async (req, res) => {
	const { id } = req.params;
	try {
		const athlete = await Athlete.findByPk(id);
		if (!athlete) {
			return res.status(404).json({ error: 'Athlete not found' });
		}
		await athlete.destroy();
		return res
			.status(200)
			.json({ message: 'Athlete deleted successfully' });
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};
