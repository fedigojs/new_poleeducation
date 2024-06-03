import React, { useState, useEffect, useContext } from 'react';
import Modal from './Modal';
import api from '../api/api';
import './ModalVotingExercise.css';
import { AuthContext } from '../context/AuthContext';

const ModalVotingExercise = ({
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
		}
	}, [isOpen, competitionParticipationId, judgeId]);

	const fetchExerciseDetails = async () => {
		setLoading(true);
		try {
			const response = await api.get(
				`/api/comp-part/${competitionParticipationId}`
			);
			setSelectedParticipationDetails(response.data.exercises || []);
			setAthleteId(response.data.athleteId); // Предположим, что athleteId также возвращается
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

				console.log('Response from server:', response);

				if (response.data && response.data.length > 0) {
					const existingProtocol = response.data.reduce(
						(acc, item) => {
							acc[item.exerciseId] = item.result; // Возвращаем числовое значение
							return acc;
						},
						{}
					);
					console.log('Existing protocol:', existingProtocol);
					setCompletedExercises(existingProtocol);
					setIsExistingProtocol(true);
				} else {
					console.log('No existing protocol found');
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

	const handleSubmit = async (event) => {
		event.preventDefault();
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
				onClose();
				alert('Результаты успешно сохранены!');
			} else {
				throw new Error('Не удалось сохранить результаты');
			}
		} catch (error) {
			console.error('Ошибка при сохранении результатов:', error.message);
			alert('Ошибка при сохранении результатов: ' + error.message);
		}
	};

	const handleDelete = async (event) => {
		event.preventDefault();

		try {
			const response = await api.delete(
				`/api/protocol-exercise-result/participation/${competitionParticipationId}/judge/${judgeId}`
			);
			if (response.status === 200) {
				onClose();
				alert('Протокол успешно удален!');
			} else {
				throw new Error('Не удалось удалить протокол');
			}
		} catch (error) {
			console.error('Ошибка при удалении протокола:', error.message);
			alert('Ошибка при удалении протокола: ' + error.message);
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
				onClose();
				alert('Протокол успешно обновлен!');
			} else {
				throw new Error('Не удалось обновить протокол');
			}
		} catch (error) {
			console.error('Ошибка при обновлении протокола:', error.message);
			alert('Ошибка при обновлении протокола: ' + error.message);
		}
	};

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			className='modal-exercise-backdrop'>
			<div className='modal-exercise'>
				<button
					className='modal-close-button'
					onClick={onClose}>
					&times;
				</button>
				<h3>Детали упражнений</h3>
				<h2>Атлет:</h2>
				{loading ? (
					<p>Загрузка...</p>
				) : errorMessage ? (
					<p className='error-message'>{errorMessage}</p>
				) : selectedParticipationDetails.length === 0 ? (
					<p>Данные отсутствуют.</p>
				) : (
					<form onSubmit={handleSubmit}>
						<table className='details-table'>
							<thead>
								<tr>
									<th>Упражнение</th>
									<th>Описание</th>
									<th>Изображение</th>
									<th>Выполнено</th>
								</tr>
							</thead>
							<tbody>
								{selectedParticipationDetails.map((detail) => (
									<tr key={detail.id}>
										<td>{detail.name}</td>
										<td>{detail.descriptions}</td>
										<td>
											<img
												src={detail.image}
												alt={detail.name}
												className='exercise-image'
											/>
										</td>
										<td>
											<input
												type='checkbox'
												checked={
													!!completedExercises[
														detail.id
													]
												}
												onChange={() =>
													handleCheckboxChange(
														detail.id
													)
												}
											/>
										</td>
									</tr>
								))}
							</tbody>
						</table>
						<div className='total-score'>
							<h3>Общая сумма баллов: {calculateTotalScore()}</h3>
						</div>
						{isExistingProtocol ? (
							<>
								<button
									className='update-score'
									onClick={handleUpdate}>
									Обновить результаты
								</button>
								<button
									className='delete-score'
									onClick={handleDelete}>
									Удалить протокол
								</button>
							</>
						) : (
							<button
								type='submit'
								className='submit-score'>
								Сохранить результаты
							</button>
						)}
					</form>
				)}
			</div>
		</Modal>
	);
};

export default ModalVotingExercise;
