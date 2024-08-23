// controllers/authController.js
const { User, Role } = require('../models');
const bcrypt = require('bcrypt');
const jwtUtils = require('../src/middleware/jwtutils');

exports.register = async (req, res) => {
	const { firstName, lastName, email, password } = req.body;
	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await User.create({
			firstName,
			lastName,
			email,
			password: hashedPassword,
			roleId: 4,
		});

		const safeUser = newUser.toJSON();
		delete safeUser.password;
		return res.status(201).json(safeUser);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: error.message });
	}
};

exports.createUserWithRole = async (req, res) => {
	const { firstName, lastName, email, password, roleId } = req.body;
	try {
		const hashedPassword = await bcrypt.hash(password, 10); // хеширование пароля
		// Создание пользователя и назначение роли одновременно
		const user = await User.create({
			firstName,
			lastName,
			email,
			password: hashedPassword,
			roleId,
		});
		// Прячем пароль перед отправкой клиенту
		const safeUser = user.toJSON();
		delete safeUser.password;
		return res.status(201).json(safeUser);
	} catch (error) {
		return res.status(400).json({ error: error.message });
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

exports.checkEmail = async (req, res) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ where: { email } });

		if (user) {
			return res.json({ exists: true });
		} else {
			return res.json({ exists: false });
		}
	} catch (error) {
		console.error('Error checking email:', error);
		return res.status(500).json({ message: 'Internal server error' });
	}
};
