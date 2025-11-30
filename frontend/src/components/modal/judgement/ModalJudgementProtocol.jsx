import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Table, Radio, Input, Space, message } from 'antd';
import api from '../../../api/api';
import { AuthContext } from '../../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import './ModalJudgementProtocol.css';

const ModalJudgementProtocol = ({
	isOpen,
	onClose,
	protocol,
	errorMessage,
	competitionParticipationId,
	protocolTypeId: initialProtocolTypeId,
	protocolId,
	athleteId,
}) => {
	const { t } = useTranslation();
	const { user } = useContext(AuthContext);
	const [protocolTypeId, setProtocolTypeId] = useState(initialProtocolTypeId);
	const [isExistingProtocol, setIsExistingProtocol] = useState(false);
	const [judgeId, setJudgeId] = useState(null);
	const [scores, setScores] = useState([]);
	const [generalComment, setGeneralComment] = useState('');
	const [isInitialized, setIsInitialized] = useState(false);
	const [isProtocolLoaded, setIsProtocolLoaded] = useState(false);

	const resetData = () => {
		setProtocolTypeId(initialProtocolTypeId);
		setIsExistingProtocol(false);
		setScores([]);
		setIsInitialized(false);
		setIsProtocolLoaded(false);
		setGeneralComment('');
	};

	useEffect(() => {
		if (protocol && protocol.length > 0) {
			setProtocolTypeId(protocol[0].protocolTypeId);
		} else {
			setProtocolTypeId(undefined);
		}
	}, [protocol]);

	useEffect(() => {
		if (protocol && user && !isInitialized) {
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
				step: element.step,
				score: element.score || 0,
				comment: element.comment || '',
			}));

			// Установить общий комментарий из первого элемента
			if (protocol[0]?.comment) {
				setGeneralComment(protocol[0].comment);
			}

			setScores(newScores);
			setJudgeId(user.userId);
			setIsInitialized(true);
		}
	}, [protocol, user, isInitialized, competitionParticipationId, athleteId]);

	useEffect(() => {
		const loadExistingProtocol = async () => {
			if (isOpen && protocolTypeId && judgeId && !isProtocolLoaded) {
				try {
					const response = await api.get(
						`/api/protocol-result/athlete/${athleteId}/participation/${competitionParticipationId}/type/${protocolTypeId}/judge/${judgeId}`
					);
					if (response.data && response.data.length > 0) {
						const existingProtocol = response.data.map((item) => ({
							...item,
							elementName: item.detail.elementName,
							maxScore: item.detail.maxScore,
							step: item.detail.step,
							comment: item.comment || '',
						}));

						// Установить общий комментарий из первого элемента
						if (response.data[0]?.comment) {
							setGeneralComment(response.data[0].comment);
						}

						setScores(existingProtocol);
						setIsExistingProtocol(true);
						setIsProtocolLoaded(true);
					} else {
						setIsProtocolLoaded(true);
					}
				} catch (error) {
					console.error(
						'Ошибка при загрузке существующего протокола:',
						error
					);
					setIsProtocolLoaded(true);
				}
			}
		};

		if (isOpen && judgeId && !isProtocolLoaded) {
			loadExistingProtocol();
		}
	}, [
		isOpen,
		protocolId,
		athleteId,
		competitionParticipationId,
		protocolTypeId,
		judgeId,
		isProtocolLoaded,
	]);

	const generateOptions = (min, max, step) => {
		const options = [];
		for (let value = min; value <= max; value += step) {
			const roundedValue = Math.round(value * 10) / 10;
			options.push({
				value: roundedValue,
				label: roundedValue.toFixed(1),
			});
		}
		return options;
	};

	const handleChange = (index, field, value) => {
		const updatedScores = scores.map((score, i) => {
			if (i === index) {
				return { ...score, [field]: value };
			}
			return score;
		});
		setScores(updatedScores);
	};

	const handleSubmit = async () => {
		const sessionDate = new Date().toISOString();

		const scoresWithDate = scores.map((score, index) => ({
			...score,
			sessionDate,
			// Добавить общий комментарий к первому элементу
			comment: index === 0 ? generalComment : '',
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
				message.success(t('common.results_successfully_preserved'));
				onClose();
			} else {
				throw new Error(t('common.could_not_save_results'));
			}
		} catch (error) {
			console.error('Ошибка при отправке оценок:', error.message);
			message.error('Ошибка при отправке оценок: ' + error.message);
		}
	};

	const handleDelete = async () => {
		try {
			if (!protocolTypeId || !competitionParticipationId || !judgeId) {
				throw new Error(
					t('common.required_protocol_removal_parameters_not_found')
				);
			}

			const response = await api.delete(
				`/api/protocol-result/type/${protocolTypeId}/participation/${competitionParticipationId}/judge/${judgeId}`
			);
			if (response.status === 200) {
				message.success(t('common.protocol_successfully_removed'));
				onClose();
			} else {
				throw new Error('Не удалось удалить протокол');
			}
		} catch (error) {
			message.error('Ошибка при удалении протокола: ' + error.message);
		}
	};

	const handleUpdate = async () => {
		const sessionDate = new Date().toISOString();

		const scoresWithDate = scores.map((score, index) => ({
			...score,
			sessionDate,
			// Добавить общий комментарий к первому элементу
			comment: index === 0 ? generalComment : '',
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
				message.success('Протокол успешно обновлен!');
				onClose();
			} else {
				throw new Error('Не удалось обновить протокол');
			}
		} catch (error) {
			message.error('Ошибка при обновлении протокола: ' + error.message);
		}
	};

	const columns = [
		{
			title: t('title.element'),
			dataIndex: 'elementName',
			key: 'elementName',
			width: '50%',
		},
		...(scores.some((record) => record.maxScore !== 0 || record.step !== 0)
			? [
					{
						title: t('title.score'),
						key: 'score',
						width: '50%',
						render: (_, record, index) => {
							const min =
								record.maxScore < 0 ? record.maxScore : 0;
							const max =
								record.maxScore < 0 ? 0 : record.maxScore;
							const step = record.step;
							if (record.maxScore === 0 && record.step === 0) {
								return null;
							}
							const options = generateOptions(min, max, step);
							const currentScore = Math.round(record.score * 10) / 10;
							return (
								<Radio.Group
									value={currentScore}
									onChange={(e) => {
										handleChange(index, 'score', e.target.value);
									}}
									buttonStyle="solid"
									size="small"
								>
									{options.map((option) => (
										<Radio.Button
											key={option.value}
											value={option.value}
										>
											{option.label}
										</Radio.Button>
									))}
								</Radio.Group>
							);
						},
					},
			  ]
			: []),
	];

	return (
		<Modal
			open={isOpen}
			onCancel={() => {
				setIsInitialized(false);
				setIsProtocolLoaded(false);
				onClose();
			}}
			footer={null}
			title={protocol?.[0]?.protocolType?.name || 'Протокол'}
			width='80%'>
			{errorMessage ? (
				<p style={{ color: 'red' }}>{errorMessage}</p>
			) : (
				<>
					<Table
						dataSource={scores}
						columns={columns}
						rowKey='protocolDetailId'
						pagination={false}
					/>
					<div style={{ marginTop: 16 }}>
						<label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
							{t('title.comment') || 'Комментарий'}:
						</label>
						<Input.TextArea
							value={generalComment}
							onChange={(e) => setGeneralComment(e.target.value)}
							placeholder="Введите общий комментарий..."
							rows={4}
						/>
					</div>
					<Space style={{ marginTop: 16 }}>
						{isExistingProtocol ? (
							<>
								<Button
									type='primary'
									onClick={() => {
										resetData();
										handleUpdate();
									}}>
									Обновить протокол
								</Button>
								<Button
									type='danger'
									onClick={() => {
										resetData();
										handleDelete();
									}}>
									Удалить протокол
								</Button>
							</>
						) : (
							<Button
								type='primary'
								onClick={handleSubmit}>
								Сохранить протокол
							</Button>
						)}
						<Button onClick={() => {
							setIsInitialized(false);
							setIsProtocolLoaded(false);
							onClose();
						}}>Закрыть</Button>
					</Space>
				</>
			)}
		</Modal>
	);
};

ModalJudgementProtocol.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	protocol: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.number.isRequired,
			protocolTypeId: PropTypes.number,
			elementName: PropTypes.string,
			maxScore: PropTypes.number,
			step: PropTypes.number,
			score: PropTypes.number,
			comment: PropTypes.string,
			protocolType: PropTypes.shape({
				name: PropTypes.string,
			}),
		})
	),
	errorMessage: PropTypes.string,
	competitionParticipationId: PropTypes.number.isRequired,
	protocolTypeId: PropTypes.number.isRequired,
	athleteId: PropTypes.number.isRequired,
	protocolId: PropTypes.number.isRequired,
};

export default ModalJudgementProtocol;
