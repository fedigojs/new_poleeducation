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

const ModalVotingDetails = ({ isOpen, onClose, participant }) => {
	const [details, setDetails] = useState([]);
	const [totalScore, setTotalScore] = useState(0);

	useEffect(() => {
		const loadProtocolDetails = async () => {
			if (participant) {
				const data = await fetchProtocolDetails(
					participant.participation.athleteId,
					participant.participation.id // Используйте id участия, если он соответствует competitionParticipationId
				);
				setDetails(data);

				// Вычисляем общую оценку
				const total = data.reduce(
					(sum, detail) => sum + detail.score,
					0
				);
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
		const protocolName = detail.detail.protocolType.name;
		const judgeId = detail.judgeId;
		const key = `${protocolName}-${judgeId}`;
		if (!acc[key]) {
			acc[key] = [];
		}
		acc[key].push(detail);
		return acc;
	}, {});

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
											<td>{detail.detail.elementName}</td>
											<td>{detail.detail.maxScore}</td>
											<td>{detail.score}</td>
											<td>{detail.comment}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					);
				})}
			</div>
		</Modal>
	);
};

export default ModalVotingDetails;
