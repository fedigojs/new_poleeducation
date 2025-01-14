const { ProtocolElementResult, sequelize } = require('../../models');

/**
 * Calculates the adjusted element scores for a given competition participation.
 * Divides the total scores by the number of unique judges for protocolTypeId = 6.
 *
 * @param {number} competitionParticipationId - ID of the competition participation.
 * @param {object} transaction - Sequelize transaction object (optional).
 * @returns {number} - Adjusted element scores.
 */
async function calculateElementScores(
	competitionParticipationId,
	transaction = null
) {
	const elementScores = await ProtocolElementResult.findAll({
		attributes: [
			'protocolTypeId',
			[sequelize.fn('SUM', sequelize.col('score')), 'totalScore'],
			[
				sequelize.literal(
					'(CASE WHEN "ProtocolElementResult"."protocolTypeId" = 6 THEN COUNT(DISTINCT "judgeId") ELSE 1 END)'
				),
				'judgeCount',
			],
		],
		where: { competitionParticipationId },
		group: ['protocolTypeId'],
		transaction,
	});

	// Transform the result into a final adjusted score
	return elementScores.reduce((total, element) => {
		const totalScore = parseFloat(element.get('totalScore')) || 0;
		const judgeCount = parseFloat(element.get('judgeCount')) || 1;
		return total + totalScore / judgeCount;
	}, 0);
}

module.exports = { calculateElementScores };
