import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Table, Spin, notification } from 'antd';
import api from '../../../api/api';
import { AuthContext } from '../../../context/AuthContext';

const ModalJudgementExercise = ({
	isOpen,
	onClose,
	errorMessage,
	competitionParticipationId,
}) => {
	const { user } = useContext(AuthContext);
	const [selectedParticipationDetails, setSelectedParticipationDetails] =
		useState([]);
	const [loading, setLoading] = useState(false);
	const [completedExercises, setCompletedExercises] = useState({});
	const [judgeId, setJudgeId] = useState(null);
	const [athleteId, setAthleteId] = useState(null);
	const [athleteName, setAthleteName] = useState(null);
	const [isExistingProtocol, setIsExistingProtocol] = useState(false);

	useEffect(() => {
		if (user) {
			setJudgeId(user.userId);
		}
	}, [user]);

	useEffect(() => {
		if (isOpen && competitionParticipationId && judgeId) {
			fetchExerciseDetails();
			loadExistingProtocol();
		} else if (!isOpen) {
			setSelectedParticipationDetails([]);
			setCompletedExercises({});
			setIsExistingProtocol(false);
		}
	}, [isOpen, competitionParticipationId, judgeId]);

	const fetchExerciseDetails = async () => {
		setLoading(true);
		try {
			const response = await api.get(
				`/api/comp-part/${competitionParticipationId}`
			);
			setSelectedParticipationDetails(response.data.exercises || []);
			setAthleteId(response.data.athleteId);
			setAthleteName(response.data.Athlete);
		} catch (error) {
			console.error('Error fetching exercise details:', error);
			setSelectedParticipationDetails([]);
		} finally {
			setLoading(false);
		}
	};

	const loadExistingProtocol = async () => {
		if (competitionParticipationId && judgeId) {
			try {
				const response = await api.get(
					`/api/protocol-exercise-result/participation/${competitionParticipationId}/judge/${judgeId}`
				);

				if (response.data && response.data.length > 0) {
					const existingProtocol = response.data.reduce(
						(acc, item) => {
							acc[item.exerciseId] = item.result; // Возвращаем числовое значение
							return acc;
						},
						{}
					);
					setCompletedExercises(existingProtocol);
					setIsExistingProtocol(true);
				} else {
					setIsExistingProtocol(false);
				}
			} catch (error) {
				console.error(
					'Ошибка при загрузке существующего протокола:',
					error
				);
			}
		}
	};

	const handleCheckboxChange = (exerciseId) => {
		setCompletedExercises((prev) => ({
			...prev,
			[exerciseId]: prev[exerciseId] === 1 ? 0 : 1,
		}));
	};

	const calculateTotalScore = () => {
		return Object.values(completedExercises).filter(
			(result) => result === 1
		).length;
	};

	const handleSubmit = async () => {
		const results = selectedParticipationDetails.map((detail) => ({
			exerciseId: detail.id,
			result: completedExercises[detail.id] ? 1 : 0,
		}));

		try {
			const response = await api.post(
				'/api/protocol-exercise-result/score-post',
				{
					results,
					judgeId: user.userId,
					athleteId,
					competitionParticipationId,
				}
			);

			if (response.status === 201) {
				notification.success({
					message: 'Успех',
					description: 'Результаты успешно сохранены!',
					placement: 'topRight',
				});
				onClose();
			} else {
				throw new Error('Не удалось сохранить результаты');
			}
		} catch (error) {
			notification.error({
				message: 'Ошибка',
				description: `Ошибка при сохранении результатов: ${
					error.response?.data?.message || error.message
				}`,
				placement: 'topRight',
			});
			console.error(
				'Ошибка при сохранении результатов:',
				error.response?.data || error.message
			);
		}
	};

	const handleDelete = async (event) => {
		event.preventDefault();

		try {
			const response = await api.delete(
				`/api/protocol-exercise-result/participation/${competitionParticipationId}/judge/${judgeId}`
			);
			if (response.status === 200) {
				notification.success({
					message: 'Успех',
					description: 'Протокол успешно удален!',
					placement: 'topRight',
				});
				onClose();
			} else {
				throw new Error('Не удалось удалить протокол');
			}
		} catch (error) {
			console.error('Ошибка при удалении протокола:', error.message);
			notification.error({
				message: 'Ошибка',
				description: 'Ошибка при удалении протокола: ' + error.message,
				placement: 'topRight',
			});
		}
	};

	const handleUpdate = async (event) => {
		event.preventDefault();
		const results = selectedParticipationDetails.map((detail) => ({
			exerciseId: detail.id,
			result: completedExercises[detail.id] ? 1 : 0,
		}));

		try {
			const response = await api.put(
				`/api/protocol-exercise-result/participation/${competitionParticipationId}/judge/${judgeId}`,
				{
					results,
					judgeId,
					competitionParticipationId,
					athleteId,
				}
			);
			if (response.status === 200) {
				notification.success({
					message: 'Успех',
					description: 'Протокол успешно обновлен!',
					placement: 'topRight',
				});
				onClose();
			} else {
				throw new Error('Не удалось обновить протокол');
			}
		} catch (error) {
			console.error('Ошибка при обновлении протокола:', error.message);
			notification.error({
				message: 'Ошибка',
				description:
					'Ошибка при обновлении протокола: ' + error.message,
				placement: 'topRight',
			});
		}
	};

	const columns = [
		{
			title: 'Упражнение',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Описание',
			dataIndex: 'descriptions',
			key: 'descriptions',
		},
		{
			title: 'Изображение',
			dataIndex: 'image',
			key: 'image',
			render: (image, record) =>
				image ? (
					<img
						src={image}
						alt={record.name}
						style={{ width: '100px' }}
					/>
				) : (
					'Нет изображения'
				),
		},
		{
			title: 'Выполнено',
			dataIndex: 'id',
			key: 'completed',
			render: (id) => (
				<input
					type='checkbox'
					checked={!!completedExercises[id]}
					onChange={() => handleCheckboxChange(id)}
				/>
			),
		},
	];

	if (!isOpen) return null;

	return (
		<Modal
			open={isOpen}
			onCancel={onClose}
			width={1200}
			title='Детали упражнений'
			footer={[
				<Button
					key='close'
					onClick={onClose}>
					Закрыть
				</Button>,
			]}>
			{loading ? (
				<Spin size='large' />
			) : errorMessage ? (
				<p className='error-message'>{errorMessage}</p>
			) : selectedParticipationDetails.length === 0 ? (
				<p>Данные отсутствуют.</p>
			) : (
				<>
					<h3>
						{athleteName.firstName} {athleteName.lastName}
					</h3>
					<Table
						dataSource={selectedParticipationDetails}
						columns={columns}
						rowKey='id'
						pagination={{ pageSize: 50 }}
					/>
					<div style={{ textAlign: 'center', marginTop: '20px' }}>
						<div>
							<h3>Общая сумма баллов: {calculateTotalScore()}</h3>
						</div>
						{isExistingProtocol ? (
							<>
								<Button onClick={handleUpdate}>
									Обновить результаты
								</Button>
								<Button onClick={handleDelete}>
									Удалить протокол
								</Button>
							</>
						) : (
							<Button
								type='primary'
								onClick={handleSubmit}
								style={{ marginRight: '10px' }}>
								Сохранить результаты
							</Button>
						)}
					</div>
				</>
			)}
		</Modal>
	);
};

ModalJudgementExercise.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	errorMessage: PropTypes.string,
	competitionParticipationId: PropTypes.string.isRequired,
};

export default ModalJudgementExercise;
