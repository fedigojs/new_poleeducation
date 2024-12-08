const express = require('express');
const route = express.Router();
const levelRout = require('../controllers/levelController');

route.post('/', levelRout.createLevel);
route.get('/', levelRout.getAllLevels);

module.exports = route;
levelRout;
