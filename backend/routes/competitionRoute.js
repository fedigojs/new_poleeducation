const express = require('express');
const router = express.Router();
const competitionController = require('../controllers/competitionController');

router.post('/', competitionController.createCompetition);
router.get('/', competitionController.getAllCompetitions);
router.get('/:id', competitionController.getAllCompetitions);
router.put('/:id', competitionController.updateCompetition);
router.delete('/:id', competitionController.deleteCompetition);

module.exports = router;
