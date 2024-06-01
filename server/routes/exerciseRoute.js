const express = require('express');
const route = express.Router();
const exerciseRout = require('../controllers/exerciseController');

route.post('/', exerciseRout.createExercise);
route.get('/', exerciseRout.getAllExercises);
route.get('/:id', exerciseRout.getExerciseById);
route.put('/:id', exerciseRout.updateExercise);
route.delete('/:id', exerciseRout.deleteExercise);

module.exports = route;
