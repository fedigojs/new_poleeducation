import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import './ModalVotingDetails.css';
import api from '../api/api';

const fetchProtocolDetails = async (athleteId, competitionParticipationId) => {
	try {
		const response = await api.get(
			`/api/protocol-result/athlete/${athleteId}/participation/${competitionParticipationId}`
		);
		return response.data;
	} catch (error) {
		console.error('Ошибка при получении данных протокола:', error);
		return [];
	}
};

const fetchExerciseProtocolDetails = async (competitionParticipationId) => {
	try {
		const response = await api.get(
			`/api/protocol-exercise-result/participation/${competitionParticipationId}`
		);
		return response.data.exercises || [];
	} catch (error) {
		console.error(
			'Ошибка при получении данных протокола упражнений:',
			error
		);
		return [];
	}
};

const ModalVotingDetails = ({ isOpen, onClose, participant }) => {
	const [details, setDetails] = useState([]);
	const [exerciseDetails, setExerciseDetails] = useState([]);
	const [completedExercises, setCompletedExercises] = useState({});
	const [totalScore, setTotalScore] = useState(0);

	useEffect(() => {
		const loadProtocolDetails = async () => {
			if (participant) {
				const protocolData = await fetchProtocolDetails(
					participant.participation.athleteId,
					participant.participation.id // Используйте id участия, если он соответствует competitionParticipationId
				);
				console.log('Protocol Data:', protocolData);
				setDetails(protocolData);

				const exerciseData = await fetchExerciseProtocolDetails(
					participant.participation.id
				);
				console.log('Exercise Data:', exerciseData);
				const completed = exerciseData.reduce((acc, item) => {
					acc[item.exerciseId] = item.result;
					return acc;
				}, {});
				setExerciseDetails(exerciseData);
				setCompletedExercises(completed);

				// Вычисляем общую оценку
				const total =
					protocolData.reduce(
						(sum, detail) => sum + detail.score,
						0
					) +
					exerciseData.reduce((sum, item) => sum + item.result, 0);
				setTotalScore(total);
			}
		};

		if (isOpen) {
			loadProtocolDetails();
		}
	}, [isOpen, participant]);

	if (!isOpen || !participant) {
		return null;
	}

	const groupedDetails = details.reduce((acc, detail) => {
		const protocolType = detail.detail?.protocolType;
		const protocolName = protocolType?.name;
		const judgeId = detail.judgeId;
		console.log(
			`protocolType: ${protocolType}, protocolName: ${protocolName}, judgeId: ${judgeId}`
		);
		const key = `${protocolName}-${judgeId}`;
		if (protocolName && judgeId) {
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(detail);
		} else {
			console.warn(
				'Skipping detail due to missing protocolName or judgeId:',
				detail
			);
		}
		return acc;
	}, {});

	console.log('Grouped Details:', groupedDetails);

	const calculateTotalScore = () => {
		return Object.values(completedExercises).filter(
			(result) => result === 1
		).length;
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			className='modal-fullscreen'>
			<div className='modal-content detail-voting-content'>
				<button
					className='modal-close-button'
					onClick={onClose}
					aria-label='Close'>
					&times;
				</button>
				<h2>Детали спортсмена</h2>
				<p>
					Имя: {participant?.participation?.Athlete?.firstName}{' '}
					{participant?.participation?.Athlete?.lastName}
				</p>
				<p>
					Возрастная категория:{' '}
					{participant?.participation?.AthleteAge?.age}
				</p>
				<p>Загальний рахунок: {totalScore} </p>
				{Object.keys(groupedDetails).map((key, index) => {
					const [protocolName, judgeId] = key.split('-');
					console.log(
						`Protocol Name: ${protocolName}, Judge ID: ${judgeId}`
					);
					console.log('Details for this group:', groupedDetails[key]);
					return (
						<div key={index}>
							<h3>{protocolName}</h3>
							{/* Отображение ID судьи */}
							<p>Заполнено судьей: {judgeId}</p>
							<table className='protocol-table'>
								<thead>
									<tr>
										<th>Элемент</th>
										<th>Максимальный балл</th>
										<th>Оценка</th>
										<th>Комментарий</th>
									</tr>
								</thead>
								<tbody>
									{groupedDetails[key].map((detail, idx) => (
										<tr key={idx}>
											<td>
												{detail.detail?.elementName}
											</td>
											<td>{detail.detail?.maxScore}</td>
											<td>{detail.score}</td>
											<td>{detail.comment}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					);
				})}
				<h3>Детали упражнений</h3>
				<table className='protocol-table'>
					<thead>
						<tr>
							<th>Упражнение</th>
							<th>Описание</th>
							<th>Изображение</th>
							<th>Выполнено</th>
						</tr>
					</thead>
					<tbody>
						{exerciseDetails.map((detail) => (
							<tr key={detail.exerciseId}>
								<td>{detail.exercise?.name}</td>
								<td>{detail.exercise?.descriptions}</td>
								<td>
									{detail.exercise?.image && (
										<img
											src={detail.exercise.image}
											alt={detail.exercise.name}
											className='exercise-image'
										/>
									)}
								</td>
								<td>
									<input
										type='checkbox'
										checked={
											completedExercises[
												detail.exerciseId
											] === 1
										}
										readOnly
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				<div className='total-score'>
					<h3>Общая сумма баллов: {totalScore}</h3>
				</div>
			</div>
		</Modal>
	);
};

export default ModalVotingDetails;
