const express = require('express');
const router = express.Router();

const athleteAgeController = require('../controllers/athleteAgeController');

router.post('/', athleteAgeController.createAthleteAge);
router.get('/', athleteAgeController.getAllAthleteAge);

module.exports = router;
