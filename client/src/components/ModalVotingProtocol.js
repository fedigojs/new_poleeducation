import React, { useEffect, useState, useContext } from 'react';
import Modal from './Modal';
import './ModalVotingProtocol.css';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

const ModalVotingProtocol = ({
	isOpen,
	onClose,
	protocol,
	errorMessage,
	competitionParticipationId: initialCompetitionParticipationId,
	protocolTypeId: initialProtocolTypeId,
	athleteId,
	competitionId,
	protocolId,
}) => {
	const { user } = useContext(AuthContext);
	const [scores, setScores] = useState([]);
	const [competitionParticipationId, setCompetitionParticipationId] =
		useState(initialCompetitionParticipationId);
	const [protocolTypeId, setProtocolTypeId] = useState(initialProtocolTypeId);
	const [isExistingProtocol, setIsExistingProtocol] = useState(false);
	const [judgeId, setJudgeId] = useState(null);

	useEffect(() => {
		if (protocol && protocol.length > 0) {
			const protoTypeId = protocol[0].protocolTypeId;
			setProtocolTypeId(protoTypeId);
		} else {
			setProtocolTypeId(undefined);
		}
	}, [isOpen, protocol]);

	useEffect(() => {
		if (protocol && user) {
			const additionalData = {
				judgeId: user.userId,
				competitionParticipationId,
				protocolTypeId: protocol[0]?.protocolTypeId,
				athleteId,
			};

			const newScores = protocol.map((element) => ({
				...additionalData,
				protocolDetailId: element.id,
				elementName: element.elementName,
				maxScore: element.maxScore,
				score: element.score || 0,
				comment: element.comment || '',
			}));

			setScores(newScores);
			setJudgeId(user.userId); // Убедитесь, что userId устанавливается здесь
		} else {
			setScores([]);
		}
	}, [protocol, user, competitionParticipationId, athleteId]);

	useEffect(() => {
		const loadExistingProtocol = async () => {
			if (isOpen && protocolTypeId && judgeId) {
				try {
					const response = await api.get(
						`/api/protocol-result/athlete/${athleteId}/participation/${competitionParticipationId}/type/${protocolTypeId}/judge/${judgeId}`
					);

					if (response.data && response.data.length > 0) {
						const existingProtocol = response.data.map((item) => ({
							...item,
							elementName: item.detail.elementName,
							maxScore: item.detail.maxScore,
							comment: item.comment || '',
						}));

						setScores(existingProtocol);
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

		if (isOpen && judgeId) {
			loadExistingProtocol();
		}
	}, [
		isOpen,
		protocolId,
		athleteId,
		competitionParticipationId,
		protocolTypeId,
		judgeId,
	]);

	if (!isOpen || (!protocol && !errorMessage)) {
		return null;
	}

	const protocolName =
		protocol.length > 0 && protocol[0].protocolType
			? protocol[0].protocolType.name
			: 'Неизвестный протокол';

	const handleChange = (index, field, value) => {
		const updatedScores = scores.map((score, i) => {
			if (i === index) {
				return { ...score, [field]: value || 0 };
			}
			return score;
		});
		setScores(updatedScores);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		const sessionDate = new Date().toISOString();

		const scoresWithDate = scores.map((score) => ({
			...score,
			sessionDate,
		}));

		const filteredScores = scoresWithDate.map(
			({ elementName, maxScore, ...rest }) => rest
		);

		try {
			const response = await api.post(
				'/api/protocol-result/',
				filteredScores
			);
			if (response.status === 201) {
				onClose();
				alert('Оценки успешно отправлены!');
			} else {
				const errorData = await response.data;
				throw new Error(
					errorData.message || 'Не удалось отправить оценки'
				);
			}
		} catch (error) {
			console.error('Ошибка при отправке оценок:', error.message);
			alert('Ошибка при отправке оценок: ' + error.message);
		}
	};

	const handleDelete = async (event) => {
		event.preventDefault(); // Предотвращаем отправку формы

		try {
			if (!protocolTypeId || !competitionParticipationId || !judgeId) {
				throw new Error(
					'Необходимые параметры для удаления протокола не найдены'
				);
			}

			const response = await api.delete(
				`/api/protocol-result/type/${protocolTypeId}/participation/${competitionParticipationId}/judge/${judgeId}`
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
		const sessionDate = new Date().toISOString();

		const scoresWithDate = scores.map((score) => ({
			...score,
			sessionDate,
		}));

		const filteredScores = scoresWithDate.map(
			({ elementName, maxScore, ...rest }) => rest
		);

		try {
			const response = await api.put(
				`/api/protocol-result/type/${protocolTypeId}/participation/${competitionParticipationId}/judge/${judgeId}`,
				filteredScores
			);
			if (response.status === 200) {
				onClose();
				alert('Протокол успешно обновлен!');
			} else {
				const errorData = await response.data;
				throw new Error(
					errorData.message || 'Не удалось обновить протокол'
				);
			}
		} catch (error) {
			console.error('Ошибка при обновлении протокола:', error.message);
			alert('Ошибка при обновлении протокола: ' + error.message);
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
					<form onSubmit={handleSubmit}>
						<h2>{protocolName}</h2>
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
								{scores.length > 0 ? (
									scores.map((element, index) => (
										<tr key={index}>
											<td>{element.elementName}</td>
											<td>{element.maxScore}</td>
											<td>
												<input
													type='number'
													min={
														element.maxScore < 0
															? element.maxScore
															: 0
													}
													max={
														element.maxScore < 0
															? 0
															: element.maxScore
													}
													value={element.score}
													onChange={(e) =>
														handleChange(
															index,
															'score',
															parseFloat(
																e.target.value
															) || 0
														)
													}
													step='0.1'
												/>
											</td>
											<td>
												<input
													type='text'
													value={element.comment}
													onChange={(e) =>
														handleChange(
															index,
															'comment',
															e.target.value
														)
													}
													placeholder='Add a comment...'
												/>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan='4'>No scores available</td>
									</tr>
								)}
							</tbody>
						</table>
						{isExistingProtocol ? (
							<>
								<button
									className='update-score'
									onClick={handleUpdate}>
									Update Scores
								</button>
								<button
									className='delete-score'
									onClick={handleDelete}>
									Delete Protocol
								</button>
							</>
						) : (
							<button
								className='submit-score'
								type='submit'>
								Submit Scores
							</button>
						)}
					</form>
				)}
			</div>
		</Modal>
	);
};

export default ModalVotingProtocol;
