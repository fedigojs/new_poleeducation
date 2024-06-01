import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import api from '../api/api';
import './ModalVoting.css';
import ModalVotingProtocol from './ModalVotingProtocol';

const ModalVoting = ({ isOpen, onClose, participant, judgeId, onSubmit }) => {
	const [protocols, setProtocols] = useState([]);
	const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
	const [selectedProtocol, setSelectedProtocol] = useState(null);
	const [errorMessage, setErrorMessage] = useState('');
	const [shouldUpdate, setShouldUpdate] = useState(false); // Новое состояние

	useEffect(() => {
		if (isOpen && participant?.participation?.AthleteTrend) {
			loadProtocols();
		}
	}, [isOpen, participant]);

	useEffect(() => {
		// Это состояние заставит компонент обновляться при изменении протоколов
	}, [shouldUpdate]);

	const loadProtocols = async () => {
		if (participant?.participation?.AthleteTrend) {
			const trendId = participant.participation.AthleteTrend.id;
			try {
				const response = await api.get(
					`/api/athletes-trend/protocols/${trendId}`
				);
				const updatedProtocols = await Promise.all(
					response.data.protocolTrends.map(async (protocol) => {
						const isFilled = await checkIfProtocolIsFilled(
							protocol.protocolType.id,
							participant.participation.athleteId,
							participant.competitionParticipationId,
							judgeId
						);
						return {
							...protocol,
							isFilled,
						};
					})
				);
				setProtocols(updatedProtocols);
				setShouldUpdate(!shouldUpdate); // Переключение состояния
			} catch (error) {
				console.error('Error fetching protocols:', error);
				setProtocols([]);
			}
		}
	};

	const checkIfProtocolIsFilled = async (
		protocolTypeId,
		athleteId,
		competitionParticipationId,
		judgeId
	) => {
		try {
			const response = await api.get(
				`/api/protocol-result/athlete/${athleteId}/participation/${competitionParticipationId}/type/${protocolTypeId}/judge/${judgeId}`
			);
			return response.data && response.data.length > 0;
		} catch (error) {
			return false;
		}
	};

	if (!isOpen) return null;

	const openProtocolModal = async (protocolTypeId) => {
		try {
			const response = await api.get(
				`/api/protocol-details/${protocolTypeId}`
			);
			if (response.data) {
				setSelectedProtocol(response.data);
				setIsProtocolModalOpen(true);
				setErrorMessage('');
			} else {
				setErrorMessage(
					`Протокол с таким protocolTypeId ${protocolTypeId} не найден.`
				);
				setIsProtocolModalOpen(true);
			}
		} catch (error) {
			console.error('Error fetching protocol data:', error);
			setErrorMessage('Ошибка получения данных протокола.');
			setIsProtocolModalOpen(true);
		}
	};

	const closeProtocolModal = () => {
		setIsProtocolModalOpen(false);
		setSelectedProtocol(null);
		setErrorMessage('');
	};

	return (
		<>
			<Modal
				isOpen={isOpen}
				onClose={onClose}
				className='modalvoting-backdrop'>
				<div className='modalvoting'>
					<button
						className='modal-close-button'
						onClick={(e) => {
							e.stopPropagation();
							onClose();
						}}>
						&times;
					</button>
					<h2>
						Голосование за{' '}
						{participant?.participation?.Athlete?.firstName}{' '}
						{participant?.participation?.Athlete?.lastName}
					</h2>
					<div className='button-container'>
						{protocols.map((protocol) => (
							<button
								key={protocol.id}
								className={`protocol_button ${
									protocol.isFilled ? 'filled' : ''
								}`}
								onClick={() => {
									openProtocolModal(protocol.protocolType.id);
								}}>
								{protocol.protocolType.name}
							</button>
						))}
					</div>
				</div>
			</Modal>
			<ModalVotingProtocol
				isOpen={isProtocolModalOpen}
				onClose={closeProtocolModal}
				protocol={selectedProtocol}
				errorMessage={errorMessage}
				athleteId={participant?.participation?.athleteId}
				competitionId={participant?.participation?.competitionId}
				protocolId={selectedProtocol?.id}
				competitionParticipationId={
					participant?.competitionParticipationId
				}
				protocolTypeId={selectedProtocol?.protocolTypeId}
			/>
		</>
	);
};

export default ModalVoting;
