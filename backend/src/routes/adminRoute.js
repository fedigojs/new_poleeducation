const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorizeRoles } = require('../middleware/authenticate');

// Route to access the dashboard
router.get(
	'/dashboard',
	authenticate,
	authorizeRoles('Admin'),
	adminController.dashboard
);

// User routes
router.get('/users', adminController.listUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Role routes
router.get('/roles', adminController.listRoles);
router.post('/roles', adminController.createRole);
router.put('/roles/:id', adminController.updateRole);
router.delete('/roles/:id', adminController.deleteRole);

// Add routes for other models and operations as needed

module.exports = router;
