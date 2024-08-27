const express = require('express');
const route = express.Router();
const scoreRoute = require('../controllers/scoreController');

route.post('/', scoreRoute.createScore);
route.get('/', scoreRoute.getAllScores);
route.get('/:id', scoreRoute.getScoreById);
route.put('/:id', scoreRoute.updateScore);
route.delete('/:id', scoreRoute.deleteScore);

module.exports = route;
