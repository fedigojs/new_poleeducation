// routes/drawResultRoute.js
const express = require('express');
const router = express.Router();
const drawResultController = require('../controllers/drawResultController');

router.get('/by-coach/:userId', drawResultController.getDrawResultsByCoach);
router.get('/competition/:competitionId', drawResultController.getDrawResultsByCompetition);
router.get('/competition/:competitionId/coach/:userId', drawResultController.getDrawResultsByCompetitionAndCoach);
router.post('/draw/:competitionId', drawResultController.conductDraw);
router.put('/update-timing/:competitionId', drawResultController.updateTiming);
router.get('/', drawResultController.getAllDrawResults);
router.put('/:id', drawResultController.updateDrawResult);
router.delete(
	'/delete/:competitionId',
	drawResultController.deleteDrawResultsByCompetitionId
);

router.put('/update-total-score/:id', drawResultController.updateTotalScore);

module.exports = router;
