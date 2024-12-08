const { DetailExercises, Exercise } = require('../models');

// Контроллер для получения данных об упражнениях
exports.getDetailExercises = async (req, res) => {
	try {
		const detailExercises = await DetailExercises.findAll({
			include: [
				{
					model: Exercise,
					as: 'exercise',
					include: ['discipline', 'level'], // Подгрузка дополнительных связей из модели Exercise
				},
			],
			order: [['id', 'ASC']],
		});
		res.json(detailExercises); // Сортировка по ID
	} catch (error) {
		res.status(500).send({
			message: 'Ошибка при получении данных: ' + error.message,
		});
	}
};
