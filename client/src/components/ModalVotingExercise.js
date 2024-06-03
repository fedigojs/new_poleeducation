import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../api/api';
import './ModalVotingExercise.css';

const ModalVotingExercise = ({
	isOpen,
	onClose,
	protocolTypeId,
	athleteId,
	competitionParticipationId,
}) => {
	const [exerciseDetails, setExerciseDetails] = useState([]);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		if (isOpen) {
			loadExerciseDetails();
		}
	}, [isOpen]);

	const loadExerciseDetails = async () => {
		try {
			const response = await api.get(
				`/api/exercise-details/${protocolTypeId}/${athleteId}/${competitionParticipationId}`
			);
			setExerciseDetails(response.data);
		} catch (error) {
			console.error('Error fetching exercise details:', error);
			setErrorMessage('Ошибка получения данных упражнений.');
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			className='modal-fullscreen'>
			<div className='modal-content'>
				<button
					className='modal-close-button'
					onClick={onClose}
					aria-label='Close'>
					&times;
				</button>
				{errorMessage ? (
					<div className='error-message'>{errorMessage}</div>
				) : (
					<div>
						<h3>Детали упражнений</h3>
						<h2>Атлет:</h2>
						<table className='details-table'>
							<thead>
								<tr>
									<th>Упражнение</th>
									<th>Описание</th>
									<th>Изображение</th>
								</tr>
							</thead>
							<tbody>
								{exerciseDetails.map((detail, index) => (
									<tr key={index}>
										<td>{detail.exercise.name}</td>
										<td>{detail.exercise.descriptions}</td>
										<td>
											<img
												src={detail.exercise.image}
												alt={detail.exercise.name}
												className='exercise-image'
											/>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</Modal>
	);
};

export default ModalVotingExercise;
