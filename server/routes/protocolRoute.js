const express = require('express');
const route = express.Router();
const protocolRoute = require('../controllers/protocolController');

route.post('/', protocolRoute.createProtocol);
route.get('/', protocolRoute.getAllProtocols);
route.get('/:id', protocolRoute.getProtocolById);
route.put('/:id', protocolRoute.updateProtocol);
route.delete('/:id', protocolRoute.deleteProtocol);

module.exports = route;
