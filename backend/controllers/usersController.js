const { User, Role } = require('../models');
const bcrypt = require('bcrypt');

// Создание пользователя с ролью
exports.createUserWithRole = async (req, res) => {
	const { firstName, lastName, email, password, roleId } = req.body;
	console.log(req.body);
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

// Просмотр пользователей с ролями
exports.getUsersWithRoles = async (req, res) => {
	try {
		const users = await User.findAll({
			include: [{ model: Role }],
			attributes: { exclude: ['password'] }, // Исключаем пароль из данных
		});
		return res.status(200).json(users);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

// Получение одного пользователя по ID
exports.getUserById = async (req, res) => {
	const { id } = req.params;
	try {
		const user = await User.findByPk(id, {
			include: [{ model: Role }],
			attributes: { exclude: ['password'] }, // Исключаем пароль из данных
		});
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}
		return res.status(200).json(user);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

// Обновление пользователя
exports.updateUser = async (req, res) => {
	const { id } = req.params;
	const { firstName, lastName, email, password, roleId } = req.body;
	try {
		const user = await User.findByPk(id);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}
		let hashedPassword = user.password;
		if (password) {
			hashedPassword = await bcrypt.hash(password, 10);
		}
		await user.update({
			firstName,
			lastName,
			email,
			password: hashedPassword,
			roleId,
		});
		const updatedUser = user.toJSON();
		delete updatedUser.password; // Прячем пароль перед отправкой клиенту
		return res.status(200).json(updatedUser);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

// Удаление пользователя
exports.deleteUser = async (req, res) => {
	const { id } = req.params;
	try {
		const user = await User.findByPk(id);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}
		await user.destroy();
		return res.status(200).json({ message: 'User deleted successfully' });
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};
