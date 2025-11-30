// controller/drawResultController.js
const {
	DrawResult,
	CompetitionsParticipation,
	Competition,
	Discipline,
	Exercise,
	Athlete,
	AthleteAge,
	AthleteTrend,
	Level,
	sequelize,
} = require('../models');

exports.conductDraw = async (req, res) => {
	try {
		const competitionId = req.params.competitionId;

		// Проверяем, существуют ли уже результаты жеребьёвки для этого соревнования
		const existingResults = await DrawResult.findOne({
			where: { competitionId: competitionId },
		});

		if (existingResults) {
			return res.status(409).send({
				// Код 409 Conflict для индикации конфликта данных
				message: 'Draw results already exist for this competition.',
			});
		}

		const participants = await CompetitionsParticipation.findAll({
			where: { competitionId },
			include: [
				{ model: AthleteTrend, as: 'AthleteTrend' },
				{ model: AthleteAge, as: 'AthleteAge' },
				{ model: Level, as: 'Level' },
				{ model: Discipline, as: 'discipline' }, // Убедитесь, что 'discipline' совпадает с псевдонимом в модели
			],
			order: [['id', 'ASC']],
		});

		if (participants.length === 0) {
			return res.status(404).send({
				message: 'No participants found for this competition ID',
			});
		}

		const groupedByTrend = groupParticipants(
			participants,
			'athleteTrendId'
		);
		let drawResults = [];
		let orderCounter = 1;

		// Создание жеребьёвки
		Object.values(groupedByTrend).forEach((trendGroup) => {
			const groupedByAge = groupParticipants(trendGroup, 'athleteAgeId');
			Object.values(groupedByAge).forEach((ageGroup) => {
				const groupedByLevel = groupParticipants(ageGroup, 'levelId');
				Object.values(groupedByLevel).forEach((levelGroup) => {
					levelGroup.forEach((participant) => {
						drawResults.push({
							competitionParticipationId: participant.id,
							performanceOrder: orderCounter++,
							competitionId: participant.competitionId,
							athleteTrendId: participant.athleteTrendId,
							athleteAgeId: participant.athleteAgeId,
							levelId: participant.levelId || null,
							timing: null,
							competitionDay: null,
						});
					});
				});
			});
		});

		await DrawResult.bulkCreate(drawResults);

		const fullDrawResults = await DrawResult.findAll({
			where: { competitionId: competitionId },
			include: [
				{
					model: CompetitionsParticipation,
					as: 'participation',
					include: [
						{ model: Athlete, as: 'Athlete' },
						{ model: Discipline, as: 'discipline' }, // Убедитесь, что 'discipline' включен здесь
						{ model: Exercise, as: 'exercises' },
						{ model: Level, as: 'Level' },
						{ model: AthleteAge, as: 'AthleteAge' },
						{ model: AthleteTrend, as: 'AthleteTrend' },
					],
				},
			],
		});

		res.status(201).send({
			message: 'Draw conducted successfully',
			drawResults: fullDrawResults,
		});
	} catch (error) {
		console.error('Error conducting draw:', error);
		res.status(500).send({
			message: 'Error conducting draw',
			error: error.message,
		});
	}
};

function groupParticipants(participants, key) {
	return participants.reduce((group, participant) => {
		const keyValue = participant[key];
		if (!group[keyValue]) {
			group[keyValue] = [];
		}
		group[keyValue].push(participant);
		return group;
	}, {});
}

exports.updateTiming = async (req, res) => {
	try {
		const updates = req.body;
		// Обновляем время для всех записей
		await Promise.all(
			updates.map((update) => {
				return DrawResult.update(
					{
						timing: update.timing,
						competitionDay: update.competitionDay,
					},
					{
						where: {
							id: update.id,
							competitionId: update.competitionId,
						},
					}
				);
			})
		);

		// Получаем обновленные данные после изменения
		const updatedResults = await DrawResult.findAll({
			where: {
				id: { [sequelize.Op.in]: updates.map((u) => u.id) },
			},
			include: [
				{
					model: CompetitionsParticipation,
					as: 'participation',
					include: [
						{ model: Athlete, as: 'Athlete' },
						{ model: Discipline, as: 'discipline' },
						{ model: Exercise, as: 'exercises' },
						{ model: Level, as: 'Level' },
						{ model: AthleteAge, as: 'AthleteAge' },
						{ model: AthleteTrend, as: 'AthleteTrend' },
					],
				},
			],
		});

		res.status(200).json({
			message: 'Timing updated successfully',
			results: updatedResults,
		});
	} catch (error) {
		console.error('Error updating timing:', error);
		res.status(500).send({
			message: 'Error updating timing',
			error: error.message,
		});
	}
};

exports.getAllDrawResults = async (req, res) => {
	try {
		const drawResults = await DrawResult.findAll({
			include: [
				{
					model: CompetitionsParticipation,
					as: 'participation',
					include: [
						{
							model: Athlete,
							as: 'Athlete',
						},
						{
							model: Discipline,
							as: 'discipline',
						},
						{
							model: Exercise,
							as: 'exercises',
						},
						{
							model: Level,
							as: 'Level',
						},
						{
							model: AthleteAge,
							as: 'AthleteAge',
						},
						{
							model: AthleteTrend,
							as: 'AthleteTrend',
						},
					],
				},
			],
		});
		res.status(200).json(drawResults);
	} catch (error) {
		console.error('Error retrieving draw results:', error);
		res.status(500).json({
			message: 'Error retrieving draw results',
			error: error.message,
		});
	}
};
exports.updateDrawResult = async (req, res) => {
	try {
		const updated = await DrawResult.update(req.body, {
			where: { id: req.params.id },
		});

		if (updated[0] === 0) {
			return res
				.status(404)
				.json({ message: 'No draw result found with this ID' });
		}

		const updatedDrawResult = await DrawResult.findByPk(req.params.id);
		res.status(200).json(updatedDrawResult);
	} catch (error) {
		console.error('Error updating draw result:', error);
		res.status(400).json({
			message: 'Error updating draw result',
			error: error.message,
		});
	}
};
exports.deleteDrawResultsByCompetitionId = async (req, res) => {
	try {
		const count = await DrawResult.destroy({
			where: {
				competitionId: req.params.competitionId,
			},
		});

		if (count === 0) {
			return res.status(404).json({
				message:
					'No draw results found for this competition participation ID',
			});
		}

		res.status(200).json({
			message: `Successfully deleted ${count} draw results.`,
		});
	} catch (error) {
		console.error('Error deleting draw results:', error);
		res.status(500).json({
			message: 'Error deleting draw results',
			error: error.message,
		});
	}
};

exports.getDrawResultsByCoach = async (req, res) => {
	try {
		const { userId } = req.params; // Получаем userId из параметров маршрута

		if (!userId) {
			return res.status(400).json({
				message: 'UserId is required',
			});
		}

		const drawResults = await DrawResult.findAll({
			include: [
				{
					model: CompetitionsParticipation,
					as: 'participation',
					include: [
						{
							model: Athlete,
							as: 'Athlete',
							where: { coachId: userId }, // Фильтрация по coachId
						},
						{
							model: Discipline,
							as: 'discipline',
						},
						{
							model: Exercise,
							as: 'exercises',
						},
						{
							model: Level,
						},
						{
							model: AthleteAge,
						},
						{
							model: AthleteTrend,
						},
					],
				},
			],
		});
		res.status(200).json(drawResults);
	} catch (error) {
		console.error('Error retrieving draw results by coach:', error);
		res.status(500).json({
			message: 'Error retrieving draw results by coach',
			error: error.message,
		});
	}
};

exports.updateTotalScore = async (req, res) => {
	try {
		const { id } = req.params;
		const { totalScore } = req.body;

		// Обновляем значение totalScore для записи с заданным ID
		const [updated] = await DrawResult.update(
			{ totalScore },
			{ where: { id } }
		);

		if (updated === 0) {
			return res
				.status(404)
				.json({ message: 'No draw result found with this ID' });
		}

		// Получаем обновленную запись
		const updatedDrawResult = await DrawResult.findByPk(id);
		res.status(200).json(updatedDrawResult);
	} catch (error) {
		console.error('Error updating totalScore:', error);
		res.status(400).json({
			message: 'Error updating totalScore',
			error: error.message,
		});
	}
};
