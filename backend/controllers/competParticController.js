//controller/competParticController.js
const fs = require('fs');
const path = require('path');

const {
	CompetitionsParticipation,
	Competition,
	Athlete,
	AthleteAge,
	AthleteTrend,
	Level,
	Exercise,
	Discipline,
	UploadedFile,
} = require('../models');

exports.updateIsPaid = async (req, res) => {
	const { participationId } = req.params;
	const { isPaid } = req.body;
	try {
		const participation = await CompetitionsParticipation.findByPk(
			participationId
		);
		if (!participation) {
			return res.status(404).json({ error: 'Participation not found' });
		}
		await participation.update({ isPaid });
		return res.status(200).json(participation);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

exports.deleteFile = async (req, res) => {
	const { fileId } = req.params;

	try {
		// Найти файл в базе данных
		const file = await UploadedFile.findByPk(fileId);

		if (!file) {
			return res
				.status(404)
				.json({ error: 'File not found in database' });
		}

		// Удалить файл с файловой системы, если он существует
		const filePath = path.resolve(file.filePath);

		fs.access(filePath, fs.constants.F_OK, async (err) => {
			if (err) {
				// Если файл не найден, просто удаляем запись из базы
				console.warn(
					'File not found on disk, deleting record only:',
					filePath
				);
			} else {
				// Если файл найден, удаляем его
				try {
					await fs.promises.unlink(filePath);
					console.log('File deleted from disk:', filePath);
				} catch (unlinkError) {
					console.error(
						'Error deleting file from disk:',
						unlinkError
					);
					return res
						.status(500)
						.json({ error: 'Failed to delete file from disk' });
				}
			}

			// Удаляем запись из базы данных
			try {
				await file.destroy();
				return res
					.status(200)
					.json({ message: 'File deleted successfully' });
			} catch (dbError) {
				console.error(
					'Error deleting file record from database:',
					dbError
				);
				return res
					.status(500)
					.json({ error: 'Failed to delete file record' });
			}
		});
	} catch (error) {
		console.error('Error deleting file:', error);
		if (!res.headersSent) {
			return res.status(500).json({ error: error.message });
		}
	}
};

exports.createParticipation = async (req, res) => {
	const {
		athleteId,
		competitionId,
		athleteAgeId,
		athleteTrendId,
		levelId,
		disciplineId,
		exerciseIds,
		isPaid,
	} = req.body;

	const files = req.files?.files || [];
	let participation;

	try {
		const existingParticipation = await CompetitionsParticipation.findOne({
			where: {
				athleteId: parseInt(athleteId, 10),
				competitionId: parseInt(competitionId, 10),
				athleteAgeId: parseInt(athleteAgeId, 10),
				athleteTrendId: parseInt(athleteTrendId, 10),
			},
		});

		if (existingParticipation) {
			// Если такая запись найдена, отправляем ошибку
			return res
				.status(400)
				.json({ error: 'Participation already exists' });
		}

		// Приведение типов и установка значения по умолчанию для isPaid
		const participationData = {
			athleteId: parseInt(athleteId, 10),
			competitionId: parseInt(competitionId, 10),
			athleteAgeId: parseInt(athleteAgeId, 10),
			athleteTrendId: parseInt(athleteTrendId, 10),
			levelId: parseInt(levelId, 10),
			disciplineId: parseInt(disciplineId, 10),
			isPaid: isPaid !== undefined ? !!isPaid : false,
		};

		// Создание записи
		participation = await CompetitionsParticipation.create(
			participationData
		);
		console.log('Participation created:', participation);

		// Добавление упражнений, если предоставлены
		if (exerciseIds && exerciseIds.length > 0) {
			await participation.setExercises(exerciseIds);
		}
		// Сохранение файлов
		if (files && files.length > 0) {
			const fileRecords = files.map((file) => ({
				competitionParticipationId: participation.id,
				fileName: file.originalname,
				filePath: file.path,
			}));

			await UploadedFile.bulkCreate(fileRecords);
		}

		// Возвращаем созданное участие с упражнениями
		const result = await CompetitionsParticipation.findByPk(
			participation.id,
			{
				include: [
					{
						model: Exercise,
						as: 'exercises',
						through: { attributes: [] },
					},
					{
						model: UploadedFile,
						as: 'uploadedFiles',
						attributes: ['fileName', 'filePath', 'id'],
					},
				],
			}
		);

		return res.status(201).json(result);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

// Получение списка всех участий
exports.getAllParticipations = async (req, res) => {
	try {
		const participations = await CompetitionsParticipation.findAll({
			include: [
				{
					model: Competition,
					attributes: ['title'],
				},
				{
					model: Athlete,
					attributes: ['firstName', 'lastName', 'coachId'],
					include: [
						{
							model: require('../models').User,
							as: 'coach',
							attributes: ['firstName', 'lastName', 'id'],
						},
					],
				},
				{
					model: AthleteAge,
					attributes: ['age'],
				},
				{
					model: AthleteTrend,
					attributes: ['trends'],
				},
				{
					model: Level,
					attributes: ['name'],
				},
				{
					model: Exercise,
					as: 'exercises',
					through: { attributes: [] },
				},
				{
					model: Discipline,
					as: 'discipline',
					attributes: ['name'],
				},
				{
					model: UploadedFile,
					as: 'uploadedFiles',
					attributes: ['fileName', 'filePath', 'id'],
				},
			],
		});
		return res.status(200).json(participations);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

exports.getAllParticipationsByCoach = async (req, res) => {
	try {
		const { userId } = req.params; // Получаем userId (идентификатор тренера) из параметров маршрута

		if (!userId) {
			return res.status(400).json({
				message: 'UserId is required',
			});
		}

		const participations = await CompetitionsParticipation.findAll({
			include: [
				{
					model: Competition,
					attributes: ['title'],
				},
				{
					model: Athlete,
					attributes: ['firstName', 'lastName', 'coachId'],
					where: { coachId: userId },
				},
				{
					model: AthleteAge,
					attributes: ['age'],
				},
				{
					model: AthleteTrend,
					attributes: ['trends'],
				},
				{
					model: Level,
					attributes: ['name'],
				},
				{
					model: Exercise,
					as: 'exercises',
					through: { attributes: [] },
				},
				{
					model: Discipline,
					as: 'discipline',
					attributes: ['name'],
				},
				{
					model: UploadedFile,
					as: 'uploadedFiles',
					attributes: ['fileName', 'filePath', 'id'],
				},
			],
		});
		return res.status(200).json(participations);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

exports.getParticipationById = async (req, res) => {
	const { id } = req.params;
	try {
		const participation = await CompetitionsParticipation.findByPk(id, {
			include: [
				'Competition',
				'Athlete',
				'AthleteAge',
				'AthleteTrend',
				'Level',
				{
					model: Exercise,
					as: 'exercises',
					through: { attributes: [] },
				},
				{
					model: Discipline,
					as: 'discipline',
					attributes: ['name'],
				},
				{
					model: UploadedFile,
					as: 'uploadedFiles',
					attributes: ['fileName', 'filePath', 'id'],
				},
			],
			attributes: {
				include: ['isPaid'],
			},
		});
		if (!participation) {
			return res.status(404).json({ error: 'Participation not found' });
		}
		return res.status(200).json(participation);
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

// Обновление участия
exports.updateParticipation = async (req, res) => {
	const { id } = req.params;
	const {
		athleteId,
		competitionId,
		athleteAgeId,
		athleteTrendId,
		levelId,
		disciplineId,
		exerciseIds,
		removeFileIds = [],
	} = req.body;

	const files = req.files?.files || [];

	try {
		const participation = await CompetitionsParticipation.findByPk(id, {
			include: [{ model: UploadedFile, as: 'uploadedFiles' }],
		});

		if (!participation) {
			return res.status(404).json({ error: 'Participation not found' });
		}

		await participation.update({
			athleteId,
			competitionId,
			athleteAgeId,
			athleteTrendId,
			levelId,
			disciplineId,
		});

		// Обновление упражнений, если они предоставлены
		if (exerciseIds && exerciseIds.length > 0) {
			await participation.setExercises(exerciseIds);
		}

		// Add new files
		if (files.length > 0) {
			const fileRecords = files.map((file) => ({
				competitionParticipationId: participation.id,
				fileName: file.originalname,
				filePath: file.path,
			}));
			await UploadedFile.bulkCreate(fileRecords);
		}

		// Remove old files
		if (removeFileIds.length > 0) {
			const filesToDelete = await UploadedFile.findAll({
				where: { id: removeFileIds },
			});
			filesToDelete.forEach((file) => {
				fs.unlinkSync(file.filePath);
			});
			await UploadedFile.destroy({
				where: { id: removeFileIds },
			});
		}

		// Повторно загрузить запись участия с обновленными файлами
		const updatedParticipation = await CompetitionsParticipation.findByPk(
			id,
			{
				include: [
					{
						model: Exercise,
						as: 'exercises',
						through: { attributes: [] },
					},
					{
						model: UploadedFile,
						as: 'uploadedFiles',
						attributes: ['id', 'fileName', 'filePath', 'id'],
					},
				],
			}
		);
		return res.status(200).json(updatedParticipation);
	} catch (error) {
		console.error('Update failed:', error);
		return res.status(400).json({ error: error.message });
	}
};

// Удаление участия
exports.deleteParticipation = async (req, res) => {
	const { id } = req.params;
	try {
		const participation = await CompetitionsParticipation.findByPk(id);
		if (!participation) {
			return res.status(404).json({ error: 'Participation not found' });
		}
		await participation.destroy();
		return res
			.status(200)
			.json({ message: 'Participation deleted successfully' });
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
};

// GET /api/comp-part/trends/:competitionId
exports.getTrendsByCompetition = async (req, res) => {
	try {
		const { competitionId } = req.params;
		const participations = await CompetitionsParticipation.findAll({
			where: { competitionId },
			include: [
				{
					model: AthleteTrend,
					attributes: ['trends'],
				},
			],
		});
		res.status(200).json(participations);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
};
