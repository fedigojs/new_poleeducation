const express = require('express');
const router = express.Router();
const judgementRoute = require('../../controllers/n1/judgementCompetitionController');

router.get('/all', judgementRoute.getAllJudgementList);

module.exports = router;
