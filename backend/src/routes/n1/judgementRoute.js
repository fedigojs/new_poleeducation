const express = require('express');
const router = express.Router();
const judgementRoute = require('../../controllers/n1/judgementCompetitionController');

router.get('/all', judgementRoute.getAllJudgementList);
router.get('/by-coach/:userId', judgementRoute.getJudgementListByCoach);

module.exports = router;
