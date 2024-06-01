// controllers/authController.js
const { User, Role } = require('../models');
const bcrypt = require('bcrypt');
const jwtUtils = require('../src/middleware/jwtutils');

exports.register = async (req, res) => {
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

		res.status(201).json({
			id: newUser.id,
			firstName: newUser.firstName,
			lastName: newUser.lastName,
			roleId: newUser.roleId,
			email: newUser.email,
			token: jwtUtils.generateToken(newUser),
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

exports.login = async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await User.findOne({ where: { email }, include: [Role] });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ message: 'Incorrect password' });
		}
		const token = jwtUtils.generateToken(user);
		res.status(200).json({
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			roleId: user.roleId,
			email: user.email,
			roleName: user.Role.name,
			token: jwtUtils.generateToken(user),
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};
