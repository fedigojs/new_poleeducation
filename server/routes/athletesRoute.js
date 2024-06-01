//routes/athlethesRoute.js
const express = require('express');
const router = express.Router();
const athletesController = require('../controllers/athletesController');

router.post('/', athletesController.createAthlete);
router.get('/', athletesController.getAthletes);
router.get('/:id', athletesController.getAthleteById);
router.put('/:id', athletesController.updateAthlete);
router.delete('/:id', athletesController.deleteAthlete);

module.exports = router;
