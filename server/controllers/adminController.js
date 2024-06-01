// controllers/adminController.js
const { User, Role } = require('../models');
const bcrypt = require('bcrypt');

exports.dashboard = async (req, res) => {
	try {
		const usersCount = await User.count();
		// Дополнительные данные для дэшборда
		res.status(200).json({
			usersCount,
			// ... дополнительные данные
		});
	} catch (error) {
		res.status(500).json({ message: 'Error accessing the dashboard' });
	}
};

exports.listUsers = async (req, res) => {
	try {
		const users = await User.findAll({
			include: ['role'],
		});
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: 'Error retrieving users' });
	}
};

exports.createUser = async (req, res) => {
	const { firstName, lastName, email, password, roleId } = req.body;
	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await User.create({
			firstName,
			lastName,
			email,
			password: hashedPassword,
			roleId,
		});
		res.status(201).json(newUser);
	} catch (error) {
		res.status(500).json({ message: 'Error creating user' });
	}
};

exports.updateUser = async (req, res) => {
	const { id } = req.params;
	const { firstName, lastName, email, roleId } = req.body;
	try {
		const user = await User.findByPk(id);
		if (user) {
			await user.update({
				firstName,
				lastName,
				email,
				roleId,
			});
			res.status(200).json(user);
		} else {
			res.status(404).json({ message: 'User not found' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Error updating user' });
	}
};

exports.deleteUser = async (req, res) => {
	const { id } = req.params;
	try {
		const user = await User.findByPk(id);
		if (user) {
			await user.destroy();
			res.status(200).json({ message: 'User deleted successfully' });
		} else {
			res.status(404).json({ message: 'User not found' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Error deleting user' });
	}
};

exports.listRoles = async (req, res) => {
	try {
		const roles = await Role.findAll();
		res.status(200).json(roles);
	} catch (error) {
		res.status(500).json({ message: 'Error retrieving roles' });
	}
};

exports.createRole = async (req, res) => {
	const { name } = req.body;
	try {
		const newRole = await Role.create({ name });
		res.status(201).json(newRole);
	} catch (error) {
		res.status(500).json({ message: 'Error creating role' });
	}
};

exports.updateRole = async (req, res) => {
	const { id } = req.params;
	const { name } = req.body;
	try {
		const role = await Role.findByPk(id);
		if (role) {
			await role.update({ name });
			res.status(200).json(role);
		} else {
			res.status(404).json({ message: 'Role not found' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Error updating role' });
	}
};

exports.deleteRole = async (req, res) => {
	const { id } = req.params;
	try {
		const role = await Role.findByPk(id);
		if (role) {
			await role.destroy();
			res.status(200).json({ message: 'Role deleted successfully' });
		} else {
			res.status(404).json({ message: 'Role not found' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Error deleting role' });
	}
};

// И так далее для других моделей и операций в вашем приложении...
