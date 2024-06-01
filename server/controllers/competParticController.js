//controller/competParticController.js

const {
	CompetitionsParticipation,
	Competition,
	Athlete,
	AthleteAge,
	AthleteTrend,
	Level,
	Exercise,
	Discipline,
} = require('../models');

// Создание участия
exports.createParticipation = async (req, res) => {
	const {
		athleteId,
		competitionId,
		athleteAgeId,
		athleteTrendId,
		levelId,
		disciplineId,
		exerciseIds,
	} = req.body;
	try {
		const existingParticipation = await CompetitionsParticipation.findOne({
			where: {
				athleteId,
				competitionId,
				athleteAgeId,
				athleteTrendId,
			},
		});

		if (existingParticipation) {
			// Если такая запись найдена, отправляем ошибку
			return res
				.status(400)
				.json({ error: 'Participation already exists' });
		}

		const participation = await CompetitionsParticipation.create({
			athleteId,
			competitionId,
			athleteAgeId,
			athleteTrendId,
			levelId,
			disciplineId,
		});

		// Добавление упражнений, если предоставлены
		if (exerciseIds && exerciseIds.length > 0) {
			await participation.setExercises(exerciseIds);
		}
		// Возвращаем созданное участие с упражнениями
		const result = await CompetitionsParticipation.findByPk(
			participation.id,
			{
				include: [
					{
						model: Exercise,
						as: 'exercises',
						through: { attributes: [] },
					},
				],
			}
		);

		return res.status(201).json(participation);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

// Получение списка всех участий
exports.getAllParticipations = async (req, res) => {
	try {
		const participations = await CompetitionsParticipation.findAll({
			include: [
				{
					model: Competition,
					attributes: ['title'],
				},
				{
					model: Athlete,
					attributes: ['firstName', 'lastName'],
				},
				{
					model: AthleteAge,
					attributes: ['age'],
				},
				{
					model: AthleteTrend,
					attributes: ['trends'],
				},
				{
					model: Level,
					attributes: ['name'],
				},
				{
					model: Exercise,
					as: 'exercises',
					through: { attributes: [] }, //'code', 'descriptions', 'image'
				},
				{
					model: Discipline,
					as: 'discipline',
					attributes: ['name'],
				},
			],
		});
		return res.status(200).json(participations);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

// Получение участия по ID
exports.getParticipationById = async (req, res) => {
	const { id } = req.params;
	try {
		const participation = await CompetitionsParticipation.findByPk(id, {
			include: [
				'Competition',
				'Athlete',
				'AthleteAge',
				'AthleteTrend',
				'Level',
				{
					model: Exercise,
					as: 'exercises',
					through: { attributes: [] },
				},
				{
					model: Discipline,
					as: 'discipline',
					attributes: ['name'],
				},
			],
		});
		if (!participation) {
			return res.status(404).json({ error: 'Participation not found' });
		}
		return res.status(200).json(participation);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

// Обновление участия
exports.updateParticipation = async (req, res) => {
	const { id } = req.params;
	console.log('Updating participation with:', req.body);
	const {
		athleteId,
		competitionId,
		athleteAgeId,
		athleteTrendId,
		levelId,
		disciplineId,
		exerciseIds,
	} = req.body;

	try {
		const participation = await CompetitionsParticipation.findByPk(id);
		if (!participation) {
			return res.status(404).json({ error: 'Participation not found' });
		}

		await participation.update({
			athleteId, // Убедитесь, что эти поля теперь включены
			competitionId,
			athleteAgeId,
			athleteTrendId,
			levelId,
			disciplineId,
			exerciseIds,
		});

		// Обновление упражнений, если они предоставлены
		if (exerciseIds && exerciseIds.length > 0) {
			await participation.setExercises(exerciseIds);
		}

		// Повторное извлечение для подтверждения обновления
		const updatedParticipation = await CompetitionsParticipation.findByPk(
			id,
			{
				include: [{ model: Exercise, as: 'exercises' }],
			}
		);

		return res.status(200).json(updatedParticipation);
	} catch (error) {
		console.error('Update failed:', error);
		return res.status(400).json({ error: error.message });
	}
};

// Удаление участия
exports.deleteParticipation = async (req, res) => {
	const { id } = req.params;
	try {
		const participation = await CompetitionsParticipation.findByPk(id);
		if (!participation) {
			return res.status(404).json({ error: 'Participation not found' });
		}
		await participation.destroy();
		return res
			.status(200)
			.json({ message: 'Participation deleted successfully' });
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

// GET /api/comp-part/trends/:competitionId
exports.getTrendsByCompetition = async (req, res) => {
	try {
		const { competitionId } = req.params;
		const participations = await CompetitionsParticipation.findAll({
			where: { competitionId },
			include: [
				{
					model: AthleteTrend,
					attributes: ['trends'],
				},
			],
		});
		res.status(200).json(participations);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};
