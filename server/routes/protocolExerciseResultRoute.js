const express = require('express');
const router = express.Router();
const protocolExerciseResultController = require('../controllers/protocolExerciseResultController');

router.post(
	'/score-post',
	protocolExerciseResultController.saveProtocolExerciseResults
);
router.put(
	'/participation/:competitionParticipationId/judge/:judgeId',
	protocolExerciseResultController.updateProtocolExerciseResults
);
router.delete(
	'/participation/:competitionParticipationId/judge/:judgeId',
	protocolExerciseResultController.deleteProtocolExerciseResults
);
router.get(
	'/participation/:competitionParticipationId/judge/:judgeId',
	protocolExerciseResultController.getExistingProtocol
);
router.get(
	'/participation/:competitionParticipationId',
	protocolExerciseResultController.getProtocolExerciseDetails
);

// Новый маршрут для получения всех протоколов упражнений для конкретного участия в соревновании
router.get(
	'/participation/:competitionParticipationId',
	protocolExerciseResultController.getProtocolsByCompetitionParticipationId
);

module.exports = router;
