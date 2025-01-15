const {
	ProtocolElementResult,
	ProtocolExerciseResult,
	TotalCompetitionResults,
	Exercise,
} = require('../models');

const { calculateElementScores } = require('./utils/scoreCalculator');

exports.saveProtocolExerciseResults = async (req, res) => {
	const { results, judgeId, athleteId, competitionParticipationId } =
		req.body;

	try {
		const sessionDate = new Date();

		const savedResults = await Promise.all(
			results.map((result) =>
				ProtocolExerciseResult.upsert({
					...result,
					sessionDate,
					judgeId,
					athleteId,
					competitionParticipationId,
				})
			)
		);

		// Суммирование `score` из ProtocolElementResult
		const elementScores =
			(await calculateElementScores(competitionParticipationId)) || 0;

		const exerciseScores =
			(await ProtocolExerciseResult.sum('result', {
				where: { competitionParticipationId },
			})) || 0;

		const totalSum = elementScores + exerciseScores;

		// Обновление TotalCompetitionResults
		await TotalCompetitionResults.upsert({
			competitionParticipationId,
			totalScore: totalSum || 0,
		});

		res.status(201).json(savedResults);
	} catch (error) {
		console.error('Error saving exercise results:', error);
		res.status(500).json({ message: 'Error saving exercise results' });
	}
};

exports.updateProtocolExerciseResults = async (req, res) => {
	const { results, competitionParticipationId, athleteId } = req.body;
	const { judgeId } = req.params;

	try {
		const sessionDate = new Date();

		const updatedResults = await Promise.all(
			results.map((result) =>
				ProtocolExerciseResult.upsert({
					...result,
					sessionDate,
					judgeId,
					athleteId,
					competitionParticipationId,
				})
			)
		);

		// Суммирование `score` из ProtocolElementResult
		const elementScores =
			(await calculateElementScores(competitionParticipationId)) || 0;

		const exerciseScores =
			(await ProtocolExerciseResult.sum('result', {
				where: { competitionParticipationId },
			})) || 0;

		const totalSum = elementScores + exerciseScores;

		// Обновление TotalCompetitionResults
		await TotalCompetitionResults.upsert({
			competitionParticipationId,
			totalScore: totalSum || 0,
		});

		res.status(200).json(updatedResults);
	} catch (error) {
		console.error('Error updating exercise results:', error);
		res.status(500).json({ message: 'Error updating exercise results' });
	}
};

exports.deleteProtocolExerciseResults = async (req, res) => {
	const { competitionParticipationId, judgeId } = req.params;

	try {
		const deletedCount = await ProtocolExerciseResult.destroy({
			where: {
				competitionParticipationId,
				judgeId,
			},
		});

		// Суммирование `score` из ProtocolElementResult
		const elementScores =
			(await calculateElementScores(competitionParticipationId)) || 0;

		const exerciseScores =
			(await ProtocolExerciseResult.sum('result', {
				where: { competitionParticipationId },
			})) || 0;

		const totalSum = elementScores + exerciseScores;

		// Обновление TotalCompetitionResults
		await TotalCompetitionResults.upsert({
			competitionParticipationId,
			totalScore: totalSum || 0,
		});

		if (deletedCount > 0) {
			res.status(200).json({ message: 'Protocol successfully deleted' });
		} else {
			res.status(404).json({ message: 'Protocol not found' });
		}
	} catch (error) {
		console.error('Error deleting exercise results:', error);
		res.status(500).json({ message: 'Error deleting exercise results' });
	}
};

exports.getExistingProtocol = async (req, res) => {
	const { competitionParticipationId, judgeId } = req.params;

	try {
		const existingProtocol = await ProtocolExerciseResult.findAll({
			where: {
				competitionParticipationId,
				judgeId,
			},
		});

		if (existingProtocol.length > 0) {
			res.status(200).json(existingProtocol);
		} else {
			res.status(404).json({ message: 'No existing protocol found' });
		}
	} catch (error) {
		console.error('Error fetching existing protocol:', error);
		res.status(500).json({ message: 'Error fetching existing protocol' });
	}
};

// Новый метод для получения всех протоколов упражнений для конкретного участия в соревновании
exports.getProtocolsByCompetitionParticipationId = async (req, res) => {
	const { competitionParticipationId } = req.params;

	try {
		const protocols = await ProtocolExerciseResult.findAll({
			where: {
				competitionParticipationId,
			},
		});

		if (protocols.length > 0) {
			res.status(200).json(protocols);
		} else {
			res.status(404).json({ message: 'No protocols found' });
		}
	} catch (error) {
		console.error('Error fetching protocols:', error);
		res.status(500).json({ message: 'Error fetching protocols' });
	}
};

exports.getProtocolExerciseDetails = async (req, res) => {
	const { competitionParticipationId } = req.params;

	try {
		const existingProtocol = await ProtocolExerciseResult.findAll({
			where: {
				competitionParticipationId,
			},
			include: [
				{
					model: Exercise,
					as: 'exercise',
				},
			],
		});

		if (existingProtocol.length > 0) {
			res.status(200).json({ exercises: existingProtocol });
		} else {
			res.status(404).json({ message: 'No existing protocol found' });
		}
	} catch (error) {
		console.error('Error fetching exercise protocol details:', error);
		res.status(500).json({
			message: 'Error fetching exercise protocol details',
		});
	}
};
