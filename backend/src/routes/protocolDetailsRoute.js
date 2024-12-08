const express = require('express');
const route = express.Router();
const protocolDetailsRoute = require('../controllers/protocolDetailsController');

route.get('/', protocolDetailsRoute.getAllProtocolDetails);
route.get('/:protocolTypeId', protocolDetailsRoute.getProtocolDetailById);
module.exports = route;
