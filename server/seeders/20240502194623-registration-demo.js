'use strict';

const { faker } = require('@faker-js/faker');

module.exports = {
	up: async (queryInterface, Sequelize) => {
		let participations = [];

		console.log('Начало генерации данных...');

		// Создаем список возможных трендов и уровней
		const trends = [1, 2, 3, 4, 5];
		const levels = [1, 2, 3, 4, 5];

		for (let athleteId = 1; athleteId <= 40; athleteId++) {
			const disciplines = [1, 2, 3]; // Предполагаем, что у нас есть 3 различные дисциплины

			// Генерируем уникальные тренды и уровни для каждого атлета, используя циклическую перестановку
			const athleteTrends = faker.helpers
				.shuffle(trends)
				.slice(0, disciplines.length);
			const athleteLevels = faker.helpers
				.shuffle(levels)
				.slice(0, disciplines.length);

			disciplines.forEach((disciplineId, index) => {
				participations.push({
					athleteId: athleteId,
					competitionId: 1,
					athleteTrendId: athleteTrends[index], // уникальный тренд для каждой дисциплины
					athleteAgeId: faker.number.int({ min: 7, max: 8 }), // случайный выбор возрастной категории
					levelId: athleteLevels[index], // уникальный уровень для каждой дисциплины
					disciplineId: disciplineId,
					createdAt: new Date(),
					updatedAt: new Date(),
				});
			});

			console.log(
				`Созданы записи для атлета ${athleteId} в разных дисциплинах.`
			);
		}

		console.log('Данные сгенерированы, начинаю вставку...');
		await queryInterface.bulkInsert(
			'CompetitionsParticipations',
			participations,
			{}
		);
		console.log('Данные успешно вставлены.');
	},

	down: async (queryInterface, Sequelize) => {
		console.log('Удаление данных...');
		await queryInterface.bulkDelete('CompetitionsParticipations', null, {});
		console.log('Данные удалены.');
	},
};
