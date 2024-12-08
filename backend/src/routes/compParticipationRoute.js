const express = require('express');
const route = express.Router();
const routeCompParticipation = require('../controllers/competParticController');
const uploadFilesMw = require('../middleware/uploadFilesMw');

route.patch('/:participationId/ispaid', routeCompParticipation.updateIsPaid);
route.post('/', uploadFilesMw, routeCompParticipation.createParticipation);
route.get('/', routeCompParticipation.getAllParticipations);
route.get(
	'/by-coach/:userId',
	routeCompParticipation.getAllParticipationsByCoach
);
route.get('/:id', routeCompParticipation.getParticipationById);
route.put('/:id', uploadFilesMw, routeCompParticipation.updateParticipation);
route.delete('/:id', routeCompParticipation.deleteParticipation);
route.delete('/files/:fileId', routeCompParticipation.deleteFile);
route.get(
	'/trends/:competitionId',
	routeCompParticipation.getTrendsByCompetition
);

module.exports = route;
