// controllers/roleController.js
'use strict';

const { Role } = require('../models');

// Создание новой роли
exports.createRole = async (req, res) => {
	try {
		const { name } = req.body;
		const newRole = await Role.create({ name });
		res.status(201).send(newRole);
	} catch (error) {
		res.status(400).send(error);
	}
};

// Получение списка всех ролей
exports.getAllRoles = async (req, res) => {
	try {
		const roles = await Role.findAll({
			include: ['users'],
		});
		res.status(200).send(roles);
	} catch (error) {
		res.status(500).send(error);
	}
};

// Получение роли по идентификатору
exports.getRoleById = async (req, res) => {
	try {
		const { id } = req.params;
		const role = await Role.findByPk(id, {
			include: ['users'],
		});
		if (role) {
			res.status(200).send(role);
		} else {
			res.status(404).send({ message: 'Роль не найдена' });
		}
	} catch (error) {
		res.status(500).send(error);
	}
};

// Обновление роли
exports.updateRole = async (req, res) => {
	try {
		const { id } = req.params;
		const { name } = req.body;
		const updated = await Role.update(
			{ name },
			{
				where: { id },
			}
		);

		if (updated[0] > 0) {
			const updatedRole = await Role.findByPk(id, {
				include: ['users'],
			});
			res.status(200).send(updatedRole);
		} else {
			res.status(404).send({ message: 'Роль не найдена' });
		}
	} catch (error) {
		res.status(500).send(error);
	}
};

// Удаление роли
exports.deleteRole = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await Role.destroy({ where: { id } });
		if (deleted) {
			res.status(200).send({ message: 'Роль удалена' });
		} else {
			res.status(404).send({ message: 'Роль не найдена' });
		}
	} catch (error) {
		res.status(500).send(error);
	}
};
