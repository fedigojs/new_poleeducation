const express = require('express');
const route = express.Router();
const roleRoute = require('../controllers/roleController');

route.post('/', roleRoute.createRole);
route.get('/', roleRoute.getAllRoles);
route.get('/:id', roleRoute.getRoleById);
route.put('/:id', roleRoute.updateRole);
route.delete('/:id', roleRoute.deleteRole);

module.exports = route;
roleRoute;
