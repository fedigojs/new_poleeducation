const express = require('express');
const router = express.Router();
const protocolElementResultsController = require('../controllers/protocolElementResultsController');

router.get('/', protocolElementResultsController.findAll);
router.get('/:id', protocolElementResultsController.findOne);
router.get(
	'/athlete/:athleteId/participation/:competitionParticipationId',
	protocolElementResultsController.findAllByAthleteAndParticipation
);
router.get(
	'/athlete/:athleteId',
	protocolElementResultsController.findAllByAthlete
);
router.get(
	'/athlete/:athleteId/participation/:competitionParticipationId/type/:protocolTypeId',
	protocolElementResultsController.findAllByAthleteParticipationAndType
);
router.get(
	'/sum/:competitionParticipationId',
	protocolElementResultsController.getSumOfProtocolScores
);
router.get(
	'/athlete/:athleteId/participation/:competitionParticipationId/type/:protocolTypeId/judge/:judgeId',
	protocolElementResultsController.findAllByAthleteParticipationTypeAndJudge
);
router.get(
	'/athlete/:athleteId/participation/:competitionParticipationId/judge/:judgeId',
	protocolElementResultsController.findAllByAthleteParticipationAndJudge
);
router.post('/', protocolElementResultsController.create);
router.put(
	'/type/:protocolTypeId/participation/:competitionParticipationId/judge/:judgeId',
	protocolElementResultsController.update
);

router.delete(
	'/type/:protocolTypeId/participation/:competitionParticipationId/judge/:judgeId',
	protocolElementResultsController.delete
);

module.exports = router;
