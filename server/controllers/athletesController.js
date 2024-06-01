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

// Просмотр атлетов для тренеров и админов
exports.getAthletes = async (req, res) => {
	// const { role, userId } = req; // предполагается, что role и userId получены из аутентификационного мидлвара
	try {
		let athletes;
		// if (role === 'Admin' || role === 'Judge') {
		// Администраторы и судьи видят всех атлетов
		athletes = await Athlete.findAll({
			include: [
				{
					model: User,
					as: 'coach',
					attributes: ['id', 'firstName', 'lastName'],
				}, // Убедитесь, что тренеры связаны как 'coach' в вашей модели Athlete
			],
		});
		// } else if (role === 'Coach') {
		// 	// Тренеры видят только своих атлетов
		// 	athletes = await Athlete.findAll({
		// 		where: { coachId: userId },
		// 		include: [{ model: User, as: 'coach' }],
		// 	});
		// } else {
		// 	return res.status(403).json({ error: 'Not authorized' });
		// }

		// // Трансформация данных для отправки клиенту
		// const transformedAthletes = athletes.map((athlete) => {
		// 	return {
		// 		...athlete.toJSON(),
		// 		coachName: `${athlete.coach.firstName} ${athlete.coach.lastName}`, // Соединение имени и фамилии тренера
		// 	};
		// });

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
