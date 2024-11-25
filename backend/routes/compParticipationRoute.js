const express = require('express');
const route = express.Router();
const routeCompParticipation = require('../controllers/competParticController');
const uploadFilesMw = require('../src/middleware/uploadFilesMw');

route.patch('/:participationId/ispaid', routeCompParticipation.updateIsPaid);
route.post(
	'/',
	uploadFilesMw.array('files', 5),
	routeCompParticipation.createParticipation
);
route.get('/', routeCompParticipation.getAllParticipations);
route.get(
	'/by-coach/:userId',
	routeCompParticipation.getAllParticipationsByCoach
);
route.get('/:id', routeCompParticipation.getParticipationById);
route.put('/:id', routeCompParticipation.updateParticipation);
route.delete('/:id', routeCompParticipation.deleteParticipation);
route.get(
	'/trends/:competitionId',
	routeCompParticipation.getTrendsByCompetition
);

module.exports = route;
