const express = require('express');
const route = express.Router();
const routeDetailExercise = require('../controllers/detailExerciseController');

route.get('/', routeDetailExercise.getDetailExercises);

module.exports = route;
