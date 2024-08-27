//routes/usersRoute.js

const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticate } = require('../src/middleware/authenticate');

router.use(authenticate);

router.post('/', usersController.createUserWithRole);
router.get('/', usersController.getUsersWithRoles);
router.get('/:id', usersController.getUserById);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

module.exports = router;
