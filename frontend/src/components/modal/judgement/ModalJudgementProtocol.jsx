import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Table, Select, Input, Space, message } from 'antd';
import api from '../../../api/api';
import { AuthContext } from '../../../context/AuthContext';

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
	const { user } = useContext(AuthContext);
	const [protocolTypeId, setProtocolTypeId] = useState(initialProtocolTypeId);
	const [isExistingProtocol, setIsExistingProtocol] = useState(false);
	const [judgeId, setJudgeId] = useState(null);
	const [scores, setScores] = useState([]);

	const resetData = () => {
		setProtocolTypeId(initialProtocolTypeId);
		setIsExistingProtocol(false);
		setScores([]);
	};

	useEffect(() => {
		if (protocol && protocol.length > 0) {
			setProtocolTypeId(protocol[0].protocolTypeId);
		} else {
			setProtocolTypeId(undefined);
		}
	}, [protocol]);

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
				step: element.step,
				score: element.score || 0,
				comment: element.comment || '',
			}));

			setScores(newScores);
			setJudgeId(user.userId);
		} else {
			setScores([]);
		}
	}, [protocol, user]);

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
							step: item.detail.step,
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

	const generateOptions = (min, max, step) => {
		const options = [];
		for (let value = min; value <= max; value += step) {
			options.push({
				value,
				label: value.toFixed(1),
			});
		}
		return options;
	};

	const handleChange = (index, field, value) => {
		const updatedScores = scores.map((score, i) => {
			if (i === index) {
				return { ...score, [field]: value || 0 };
			}
			return score;
		});
		setScores(updatedScores);
	};

	const handleSubmit = async () => {
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
				message.success('Оценки успешно отправлены!');
				onClose();
			} else {
				throw new Error('Не удалось отправить оценки');
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
					'Необходимые параметры для удаления протокола не найдены'
				);
			}

			const response = await api.delete(
				`/api/protocol-result/type/${protocolTypeId}/participation/${competitionParticipationId}/judge/${judgeId}`
			);
			if (response.status === 200) {
				message.success('Протокол успешно удален!');
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
			title: 'Элемент',
			dataIndex: 'elementName',
			key: 'elementName',
			width: '40%',
		},
		{
			title: 'Максимальный балл',
			dataIndex: 'maxScore',
			key: 'maxScore',
			width: '15%',
		},
		{
			title: 'Шаг',
			dataIndex: 'step',
			key: 'step',
			width: '8%',
		},
		{
			title: 'Оценка',
			key: 'score',
			width: '10%',
			render: (_, record, index) => {
				const min = record.maxScore < 0 ? record.maxScore : 0;
				const max = record.maxScore < 0 ? 0 : record.maxScore;
				const step = record.step;
				const options = generateOptions(min, max, step);
				return (
					<Select
						options={options}
						value={record.score}
						onChange={(value) =>
							handleChange(index, 'score', value)
						}
						style={{ width: '100%' }}
					/>
				);
			},
		},
		{
			title: 'Комментарий',
			key: 'comment',
			render: (_, record, index) => (
				<Input
					value={record.comment}
					onChange={(e) =>
						handleChange(index, 'comment', e.target.value)
					}
				/>
			),
		},
	];

	return (
		<Modal
			open={isOpen}
			onCancel={onClose}
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
						<Button onClick={onClose}>Закрыть</Button>
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
