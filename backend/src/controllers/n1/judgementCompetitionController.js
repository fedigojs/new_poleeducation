const {
	DrawResult,
	CompetitionsParticipation,
	Athlete,
	Level,
	AthleteAge,
} = require('../../models');

exports.getAllJudgementList = async (req, res) => {
	try {
		const judgementList = await DrawResult.findAll({
			include: [
				{
					model: CompetitionsParticipation,
					as: 'participation',
					include: [
						{
							model: Athlete,
							attributes: ['firstName', 'lastName'], // Указываем только необходимые поля
						},
						{
							model: AthleteAge,
							attributes: ['age'],
						},
					],
				},
				{
					model: Level,
					as: 'level',
					attributes: ['name'],
				},
			],
		});
		res.status(200).json(judgementList);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Error retrieving judgement list' });
	}
};
