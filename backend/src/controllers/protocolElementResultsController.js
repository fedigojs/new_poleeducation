const {
	sequelize,
	ProtocolElementResult,
	ProtocolExerciseResult,
	ProtocolDetail,
	ProtocolType,
	CompetitionsParticipation,
	TotalCompetitionResults,
	Athlete,
} = require('../models');

const { calculateElementScores } = require('./utils/scoreCalculator');

// Получение всех записей по атлету, участию в соревнованиях и типу протокола
exports.findAllByAthleteParticipationAndType = async (req, res) => {
	const { athleteId, competitionParticipationId, protocolTypeId } =
		req.params;
	try {
		const results = await ProtocolElementResult.findAll({
			where: {
				athleteId: parseInt(athleteId, 10),
				competitionParticipationId: parseInt(
					competitionParticipationId,
					10
				),
			},
			include: [
				{
					model: ProtocolDetail,
					as: 'detail',
					where: { protocolTypeId: parseInt(protocolTypeId, 10) }, // Фильтрация по типу протокола
					include: [{ model: ProtocolType, as: 'protocolType' }],
				},
				{ model: CompetitionsParticipation, as: 'participation' },
				{ model: Athlete, as: 'athlete' },
			],
		});

		if (results.length === 0) {
			console.log('No results found');
			return res.status(404).send({ message: 'No results found' });
		}

		res.status(200).send(results);
	} catch (error) {
		console.error('Ошибка при получении данных протокола:', error);
		res.status(500).send({
			message:
				error.message ||
				'Some error occurred while retrieving results.',
		});
	}
};

// Получение всех записей по атлету
exports.findAllByAthlete = async (req, res) => {
	const { athleteId } = req.params;
	try {
		const results = await ProtocolElementResult.findAll({
			where: { athleteId: parseInt(athleteId, 10) },
			include: [
				{
					model: ProtocolDetail,
					as: 'detail',
					include: [{ model: ProtocolType, as: 'protocolType' }],
				},
				{ model: CompetitionsParticipation, as: 'participation' },
				{ model: Athlete, as: 'athlete' },
			],
		});

		if (results.length === 0) {
			console.log('No results found');
			return res.status(404).send({ message: 'No results found' });
		}

		res.status(200).send(results);
	} catch (error) {
		console.error('Ошибка при получении данных протокола:', error);
		res.status(500).send({
			message:
				error.message ||
				'Some error occurred while retrieving results.',
		});
	}
};

// Получение всех записей по атлету, участию в соревнованиях и судье
exports.findAllByAthleteParticipationAndJudge = async (req, res) => {
	const { athleteId, competitionParticipationId, judgeId } = req.params;
	try {
		const results = await ProtocolElementResult.findAll({
			where: {
				athleteId: parseInt(athleteId, 10),
				competitionParticipationId: parseInt(
					competitionParticipationId,
					10
				),
				judgeId: parseInt(judgeId, 10),
			},
			include: [
				{
					model: ProtocolDetail,
					as: 'detail',
					include: [{ model: ProtocolType, as: 'protocolType' }],
				},
				{ model: CompetitionsParticipation, as: 'participation' },
				{ model: Athlete, as: 'athlete' },
			],
		});

		if (results.length === 0) {
			console.log('No results found');
			return res.status(404).send({ message: 'No results found' });
		}

		res.status(200).send(results);
	} catch (error) {
		console.error('Ошибка при получении данных протокола:', error);
		res.status(500).send({
			message:
				error.message ||
				'Some error occurred while retrieving results.',
		});
	}
};

// Получение всех записей по атлету и участию в соревнованиях
exports.findAllByAthleteAndParticipation = async (req, res) => {
	const { athleteId, competitionParticipationId } = req.params;
	try {
		const results = await ProtocolElementResult.findAll({
			where: {
				athleteId: parseInt(athleteId, 10),
				competitionParticipationId: parseInt(
					competitionParticipationId,
					10
				),
			},
			include: [
				{
					model: ProtocolDetail,
					as: 'detail',
					include: [{ model: ProtocolType, as: 'protocolType' }],
				},
				{ model: CompetitionsParticipation, as: 'participation' },
				{ model: Athlete, as: 'athlete' },
			],
		});

		if (results.length === 0) {
			console.log('No results found');
			return res.status(404).send({ message: 'No results found' });
		}

		res.status(200).send(results);
	} catch (error) {
		console.error('Ошибка при получении данных протокола:', error);
		res.status(500).send({
			message:
				error.message ||
				'Some error occurred while retrieving results.',
		});
	}
};

// Получение всех записей по судье, атлету, участию в соревнованиях и типу протокола
exports.findAllByAthleteParticipationTypeAndJudge = async (req, res) => {
	const { athleteId, competitionParticipationId, protocolTypeId, judgeId } =
		req.params;
	try {
		const results = await ProtocolElementResult.findAll({
			where: {
				athleteId: parseInt(athleteId, 10),
				competitionParticipationId: parseInt(
					competitionParticipationId,
					10
				),
				protocolTypeId: parseInt(protocolTypeId, 10),
				judgeId: parseInt(judgeId, 10),
			},
			include: [
				{
					model: ProtocolDetail,
					as: 'detail',
					include: [{ model: ProtocolType, as: 'protocolType' }],
				},
				{ model: CompetitionsParticipation, as: 'participation' },
				{ model: Athlete, as: 'athlete' },
			],
		});

		if (results.length === 0) {
			console.log('No results found');
			return res.status(404).send({ message: 'No results found' });
		}

		res.status(200).send(results);
	} catch (error) {
		console.error('Ошибка при получении данных протокола:', error);
		res.status(500).send({
			message:
				error.message ||
				'Some error occurred while retrieving results.',
		});
	}
};

// Получение всех записей
exports.findAll = async (req, res) => {
	try {
		const results = await ProtocolElementResult.findAll({
			include: [
				{
					model: ProtocolDetail,
					as: 'detail',
					include: [{ model: ProtocolType, as: 'protocolType' }],
				},
				{ model: CompetitionsParticipation, as: 'participation' },
				{ model: Athlete, as: 'athlete' },
			],
		});
		res.status(200).send(results);
	} catch (error) {
		console.error('Ошибка при получении данных протокола:', error);
		res.status(500).send({
			message:
				error.message ||
				'Some error occurred while retrieving results.',
		});
	}
};

// Получение одной записи по ID с включением связанных данных
exports.findOne = async (req, res) => {
	const id = req.params.id;
	try {
		const result = await ProtocolElementResult.findByPk(id, {
			include: [
				{
					model: ProtocolDetail,
					as: 'detail',
					include: [{ model: ProtocolType, as: 'protocolType' }],
				},
			],
		});
		if (result) {
			res.send(result);
		} else {
			res.status(404).send({
				message: `Cannot find Result with id=${id}.`,
			});
		}
	} catch (error) {
		res.status(500).send({
			message: 'Error retrieving Result with id=' + id,
		});
	}
};

// Создание новых записей из массива
exports.create = async (req, res) => {
	if (!Array.isArray(req.body)) {
		res.status(400).send({ message: 'Data must be an array of results.' });
		return;
	}

	if (
		req.body.some(
			(item) =>
				!item.competitionParticipationId ||
				!item.protocolDetailId ||
				!item.judgeId ||
				!item.sessionDate ||
				!item.athleteId
		)
	) {
		res.status(400).send({
			message:
				'Each item must contain required fields: competitionParticipationId, protocolDetailId, judgeId, and sessionDate.',
		});
		return;
	}

	if (!Array.isArray(req.body) || req.body.length === 0) {
		return res.status(400).send({
			message: 'Invalid request body: expected a non-empty array.',
		});
	}

	const { competitionParticipationId } = req.body[0];

	const transaction = await sequelize.transaction();

	try {
		const results = await ProtocolElementResult.bulkCreate(req.body, {
			individualHooks: true,
			transaction,
		});

		// Суммирование `score` из ProtocolElementResult
		const elementScores = await calculateElementScores(
			competitionParticipationId,
			transaction
		);

		const exerciseScores =
			(await ProtocolExerciseResult.sum('result', {
				where: { competitionParticipationId },
				transaction,
			})) || 0;

		const totalSum = elementScores + exerciseScores;

		// Обновление TotalCompetitionResults
		await TotalCompetitionResults.upsert(
			{
				competitionParticipationId,
				totalScore: totalSum || 0,
			},
			{ transaction }
		);

		await transaction.commit();
		res.status(201).send(results);
	} catch (error) {
		await transaction.rollback();
		console.error('Ошибка при создании записей:', error);
		res.status(500).send({
			message:
				error.message ||
				'Some error occurred while creating the Results.',
		});
	}
};

// Обновление записи
exports.update = async (req, res) => {
	const { protocolTypeId, competitionParticipationId, judgeId } = req.params;

	const transaction = await sequelize.transaction();

	try {
		if (!protocolTypeId || !competitionParticipationId || !judgeId) {
			return res
				.status(400)
				.send({ message: 'Необходимые параметры не указаны' });
		}

		const results = await ProtocolElementResult.findAll({
			where: {
				protocolTypeId: parseInt(protocolTypeId, 10),
				competitionParticipationId: parseInt(
					competitionParticipationId,
					10
				),
				judgeId: parseInt(judgeId, 10),
			},
			transaction,
		});

		if (!results || results.length === 0) {
			console.log('No results found with provided parameters');
			return res.status(404).send({ message: 'Результат не найден.' });
		}

		const updatePromises = results.map((result) => {
			const updatedData = req.body.find(
				(item) => item.protocolDetailId === result.protocolDetailId
			);
			if (updatedData) {
				console.log(
					'Updating result:',
					result.id,
					'with data:',
					updatedData
				);
				return result.update(updatedData, { transaction });
			} else {
				return Promise.resolve(result);
			}
		});

		await Promise.all(updatePromises);

		// Пересчитываем общий результат
		const elementScores =
			(await calculateElementScores(
				competitionParticipationId,
				transaction
			)) || 0;

		const exerciseScores =
			(await ProtocolExerciseResult.sum('result', {
				where: { competitionParticipationId },
				transaction,
			})) || 0;

		const totalSum = elementScores + exerciseScores;

		// Обновляем общий результат
		await TotalCompetitionResults.upsert(
			{
				competitionParticipationId,
				totalScore: totalSum || 0,
			},
			{ transaction }
		);

		await transaction.commit();

		res.send({
			message: 'Результаты успешно обновлены!',
		});
	} catch (error) {
		await transaction.rollback();
		console.error('Ошибка при обновлении результатов:', error);
		res.status(500).send({
			message: 'Не удалось обновить результаты.',
		});
	}
};

// Удаление записи
exports.delete = async (req, res) => {
	const { protocolTypeId, competitionParticipationId, judgeId } = req.params;

	const transaction = await sequelize.transaction();

	try {
		if (!protocolTypeId || !competitionParticipationId || !judgeId) {
			return res
				.status(400)
				.send({ message: 'Необходимые параметры не указаны' });
		}

		const results = await ProtocolElementResult.findAll({
			where: {
				protocolTypeId: parseInt(protocolTypeId, 10),
				competitionParticipationId: parseInt(
					competitionParticipationId,
					10
				),
				judgeId: parseInt(judgeId, 10),
			},
			transaction,
		});

		if (!results || results.length === 0) {
			console.log('No results found with provided parameters');
			return res.status(404).send({ message: 'Результат не найден.' });
		}

		await ProtocolElementResult.destroy({
			where: {
				protocolTypeId: parseInt(protocolTypeId, 10),
				competitionParticipationId: parseInt(
					competitionParticipationId,
					10
				),
				judgeId: parseInt(judgeId, 10),
			},
			transaction,
		});
		// Пересчитываем общий результат
		const elementScores =
			(await calculateElementScores(
				competitionParticipationId,
				transaction
			)) || 0;

		const exerciseScores =
			(await ProtocolExerciseResult.sum('result', {
				where: { competitionParticipationId },
				transaction,
			})) || 0;

		const totalSum = elementScores + exerciseScores;

		// Обновляем общий результат
		await TotalCompetitionResults.upsert(
			{
				competitionParticipationId,
				totalScore: totalSum || 0,
			},
			{ transaction }
		);

		await transaction.commit();

		res.send({ message: 'Результат успешно удален!' });
	} catch (error) {
		await transaction.rollback();
		console.error('Ошибка при удалении результата:', error);
		res.status(500).send({
			message: 'Не удалось удалить результат.',
		});
	}
};

// Контроллер для получения общего балла протоколов атлета
exports.getSumOfProtocolScores = async (req, res) => {
	const { competitionParticipationId } = req.params;

	try {
		const results = await ProtocolElementResult.findAll({
			where: { competitionParticipationId },
		});

		if (results.length === 0) {
			return res.status(404).send({ message: 'Протоколы не найдены' });
		}

		const totalScore = results.reduce(
			(sum, result) => sum + result.score,
			0
		);

		res.status(200).send({ totalScore });
	} catch (error) {
		console.error('Ошибка при получении суммы протоколов:', error);
		res.status(500).send({
			message: 'Ошибка при получении суммы протоколов',
		});
	}
};
