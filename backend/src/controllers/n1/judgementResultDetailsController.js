const {
	ProtocolElementResult,
	ProtocolDetail,
	ProtocolType,
	CompetitionsParticipation,
	Athlete,
	ProtocolExerciseResult,
	Exercise,
	User,
} = require('../../models');

exports.getResultsByParticipation = async (req, res) => {
	const { participationId } = req.params;

	try {
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
				{
					model: User,
					as: 'judge',
					attributes: ['firstName', 'lastName'],
				},
			],
		});

		const exerciseProtocols = await ProtocolExerciseResult.findAll({
			where: { competitionParticipationId: participationId },
			include: [
				{
					model: Exercise,
					as: 'exercise',
				},
				{
					model: User,
					as: 'judge',
					attributes: ['firstName', 'lastName'],
				},
			],
		});

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
