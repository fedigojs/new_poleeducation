const express = require('express');
const route = express.Router();
const disciplineRout = require('../controllers/disciplineController');

route.post('/', disciplineRout.createDiscipline);
route.get('/', disciplineRout.getAllDisciplines);
route.get('/:id', disciplineRout.getDisciplineById);
route.put('/:id', disciplineRout.updateDiscipline);
route.delete('/:id', disciplineRout.deleteDiscipline);

module.exports = route;
