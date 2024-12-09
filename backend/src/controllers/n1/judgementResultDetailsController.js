const {
	ProtocolElementResult,
	ProtocolDetail,
	ProtocolType,
	CompetitionsParticipation,
	Athlete,
} = require('../../models');

exports.getResultsByParticipation = async (req, res) => {
	const { participationId } = req.params;

	const results = await ProtocolElementResult.findAll({
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

	res.json(results);
};
