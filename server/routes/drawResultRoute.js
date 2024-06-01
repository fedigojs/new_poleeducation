// routes/drawResultRoute.js
const express = require('express');
const router = express.Router();
const drawResultController = require('../controllers/drawResultController');

router.post('/draw/:competitionId', drawResultController.conductDraw);
router.put('/update-timing/:competitionId', drawResultController.updateTiming);
router.get('/', drawResultController.getAllDrawResults);
router.put('/:id', drawResultController.updateDrawResult);
router.delete(
	'/delete/:competitionId',
	drawResultController.deleteDrawResultsByCompetitionId
);

module.exports = router;
