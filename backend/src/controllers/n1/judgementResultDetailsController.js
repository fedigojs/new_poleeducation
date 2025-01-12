const {
	ProtocolElementResult,
	ProtocolDetail,
	ProtocolType,
	CompetitionsParticipation,
	Athlete,
	ProtocolExerciseResult,
	Exercise,
} = require('../../models');

exports.getResultsByParticipation = async (req, res) => {
	const { participationId } = req.params;

	try {
		// Получение ProtocolElementResult с необходимыми связями
		const elementResults = await ProtocolElementResult.findAll({
			where: { competitionParticipationId: participationId },
			include: [
				{
					model: ProtocolDetail,
					as: 'detail',
					include: [
						{
							model: ProtocolType,
							as: 'protocolType',
						},
					],
				},
				{
					model: CompetitionsParticipation,
					as: 'participation',
					include: [
						{
							model: Athlete,
							as: 'Athlete',
						},
					],
				},
			],
		});

		// Логируем результаты ProtocolElementResult
		console.log(
			'ProtocolElementResult:',
			JSON.stringify(elementResults, null, 2)
		);

		// Получение ProtocolExerciseResult
		const exerciseProtocols = await ProtocolExerciseResult.findAll({
			where: { competitionParticipationId: participationId },
			include: [
				{
					model: Exercise,
					as: 'exercise',
				},
			],
		});

		// Логируем результаты ProtocolExerciseResult
		console.log(
			'ProtocolExerciseResult:',
			JSON.stringify(exerciseProtocols, null, 2)
		);

		// Объединение результатов в один ответ
		res.status(200).json({
			elementResults,
			exerciseProtocols,
		});
	} catch (error) {
		console.error('Error fetching combined results:', error);
		res.status(500).json({
			message: 'Error fetching combined results',
		});
	}
};
