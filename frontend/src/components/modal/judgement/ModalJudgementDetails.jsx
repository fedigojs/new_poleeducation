import React, { useEffect, useState, useContext } from 'react';
import { Modal } from 'antd';
import './ModalJudgementDetails.css';
import CustomTable from '../../Table/customTable';
import api from '../../../api/api';
import PropTypes from 'prop-types';
import Spinner from '../../Spinner/Spinner';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../../context/AuthContext';

const ModalJudgementDetails = ({
	isOpen,
	onClose,
	competitionParticipationId,
}) => {
	const { t } = useTranslation();
	const { user } = useContext(AuthContext);
	const [elementResults, setElementResults] = useState([]);
	const [exerciseProtocols, setExerciseProtocols] = useState([]);
	const [loading, setLoading] = useState(false);

	// Загрузка данных при открытии модального окна
	useEffect(() => {
		if (competitionParticipationId && isOpen) {
			const fetchJudgementDetails = async () => {
				try {
					setLoading(true);
					const response = await api.get(
						`/api/draw-judgement-result/participation/${competitionParticipationId}`
					);

					// Проверяем и распределяем данные
					if (response.data) {
						setElementResults(response.data.elementResults || []);
						setExerciseProtocols(
							response.data.exerciseProtocols.map((exercise) => ({
								...exercise,
								name: exercise.exercise?.name || 'Unknown',
								descriptions:
									exercise.exercise?.descriptions || '',
								image: exercise.exercise?.image || '',
								judge: exercise.judge || 'Unknown',
							})) || []
						);
					}
				} catch (error) {
					console.error('Error fetching judgement details:', error);
					setElementResults([]);
					setExerciseProtocols([]);
				} finally {
					setLoading(false);
				}
			};

			fetchJudgementDetails();
		}
	}, [competitionParticipationId, isOpen]);

	// Закрытие модального окна
	const handleClose = () => {
		setElementResults([]);
		setExerciseProtocols([]);
		onClose();
	};

	const elementColumns = [
		{
			title: 'No',
			dataIndex: 'number',
			key: 'number',
		},
		{
			title: t('title.element'),
			dataIndex: 'element',
			key: 'element',
		},
		{
			title: t('title.maximum_score'),
			dataIndex: 'max_score',
			key: 'max_score',
		},
		{
			title: t('title.score'),
			dataIndex: 'score',
			key: 'score',
		},
		{
			title: t('title.comment'),
			dataIndex: 'comment',
			key: 'comment',
		},
	];

	const exerciseColumns = [
		{
			title: t('title.exercise'),
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: t('title.description'),
			dataIndex: 'descriptions',
			key: 'descriptions',
		},
		{
			title: t('title.image'),
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
			title: t('title.completed'),
			dataIndex: 'result',
			key: 'completed',
			render: (result) => (
				<input
					type='checkbox'
					checked={!!result}
				/>
			),
		},
	];

	// Группировка elementResults для отображения
	const groupedElementResults = elementResults.reduce((acc, item) => {
		const protocolTypeName = item.detail?.protocolType?.name || 'Unknown';
		const judge = item.judge.lastName + ' ' + item.judge.firstName;

		if (!acc[protocolTypeName]) {
			acc[protocolTypeName] = { totalScore: 0, judges: {} };
		}

		if (!acc[protocolTypeName].judges[judge]) {
			acc[protocolTypeName].judges[judge] = [];
		}

		acc[protocolTypeName].judges[judge].push({
			key: item.id,
			number: acc[protocolTypeName].judges[judge].length + 1,
			element: item.detail?.elementName || 'N/A',
			score: item.score,
			max_score: item.detail?.maxScore || 0,
			comment: item.comment || '',
		});

		acc[protocolTypeName].totalScore += item.score;

		return acc;
	}, {});

	// Вычисляем TotalScore для exerciseProtocols
	const totalExerciseScore = exerciseProtocols.reduce(
		(sum, protocol) => sum + (protocol.result || 0),
		0
	);

	const athleteInfo = elementResults[0]?.participation?.Athlete || {};

	return (
		<Modal
			open={isOpen}
			onCancel={handleClose}
			footer={null}
			width={1200}>
			{loading ? (
				<Spinner />
			) : (
				<>
					<h1>{t('h2.judgement_details')}</h1>
					<h3>
						{t('table.athlete')}:{' '}
						<b>
							{athleteInfo.firstName || ''}{' '}
							{athleteInfo.lastName || ''}
						</b>
					</h3>
					{/* Отображение elementResults */}
					{Object.entries(groupedElementResults).map(
						([protocolType, protocolData]) => (
							<div
								key={protocolType}
								style={{ marginBottom: '30px' }}>
								<h3>{protocolType}</h3>
								<h5>
									<b>{t('h4.total_score')}:</b>{' '}
									{protocolData.totalScore.toFixed(2)}
								</h5>
								{Object.entries(protocolData.judges).map(
									([judge, judgeData]) => (
										<div
											key={judge}
											style={{
												marginBottom: '20px',
											}}>
											{(user?.roleName === 'Admin' ||
												user?.roleName === 'Judge') && (
												<h5>
													{t('h5.judge')}: {judge}
												</h5>
											)}
											<CustomTable
												dataSource={judgeData}
												columns={elementColumns}
												rowKey='key'
												pagination={false}
											/>
										</div>
									)
								)}
							</div>
						)
					)}
					{/* Отображение exerciseProtocols */}
					{exerciseProtocols.length > 0 && (
						<div>
							<h3>{t('h3.exercise_protocol')}</h3>
							<h5>
								<b>{t('h4.total_score')}:</b>{' '}
								{totalExerciseScore}
							</h5>
							{(user?.role === 'Admin' ||
								user?.role === 'Judge') && (
								<h5>
									{t('h5.judge')}:{' '}
									{exerciseProtocols[0]?.judge.lastName +
										' ' +
										exerciseProtocols[0]?.judge.firstName ||
										'Unknown'}
								</h5>
							)}
							<CustomTable
								dataSource={exerciseProtocols}
								columns={exerciseColumns}
								rowKey='id'
								pagination={false}
							/>
						</div>
					)}
				</>
			)}
		</Modal>
	);
};

ModalJudgementDetails.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	competitionParticipationId: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number,
	]).isRequired,
};

export default ModalJudgementDetails;
