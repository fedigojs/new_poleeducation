const express = require('express');
const router = express.Router();
const judgementResultDetailsRoute = require('../../controllers/n1/judgementResultDetailsController');

router.get(
	'/participation/:participationId',
	judgementResultDetailsRoute.getResultsByParticipation
);

module.exports = router;
