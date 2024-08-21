import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import './ContentHomePage.css';
import './TimingHomePage.css';

const TimingHomePage = () => {
	const [participants, setParticipants] = useState([]);
	const [competitions, setCompetitions] = useState([]);
	const [tabTrends, setTabTrends] = useState([]);
	const [allParticipants, setAllParticipants] = useState([]);
	const [trendOrder, setTrendOrder] = useState([]);
	const [selectedCompetition, setSelectedCompetition] = useState('');
	const [activeTrend, setActiveTrend] = useState('');

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		if (selectedCompetition) {
			fetchDataTabs();
		}
	}, [selectedCompetition]);

	const fetchProtocolStatuses = async (participant) => {
		const { athleteId, competitionParticipationId } = participant;

		if (!athleteId || !competitionParticipationId) {
			console.error('Missing athleteId or competitionParticipationId');
			return [];
		}

		try {
			const response = await api.get(
				`/api/protocol-result/athlete/${athleteId}/participation/${competitionParticipationId}`
			);

			if (response.data && response.data.length > 0) {
				const uniqueProtocolResults = Array.from(
					new Set(
						response.data.map((result) => result.protocolTypeId)
					)
				).map((protocolTypeId) => {
					return response.data.find(
						(result) => result.protocolTypeId === protocolTypeId
					);
				});

				return uniqueProtocolResults.map((result) => ({
					protocolTypeId: result.protocolTypeId,
					isFilled: result.isFilled,
				}));
			} else {
				return [];
			}
		} catch (error) {
			if (error.response && error.response.status === 404) {
				return [];
			} else {
				console.error('Error fetching protocol statuses:', error);
				return [];
			}
		}
	};

	const fetchData = async () => {
		try {
			const responseDraw = await api.get('/api/draw-result');
			const sortedData = responseDraw.data.sort(
				(a, b) => a.performanceOrder - b.performanceOrder
			);

			const updatedParticipants = await Promise.all(
				sortedData.map(async (participant) => {
					const protocolStatuses = await fetchProtocolStatuses({
						athleteId: participant.participation.athleteId,
						competitionParticipationId:
							participant.competitionParticipationId,
					});
					const totalScore = await calculateTotalScore(
						participant.participation.athleteId,
						participant.participation.id
					);
					return {
						...participant,
						protocolStatuses,
						totalScore,
					};
				})
			);

			setAllParticipants(updatedParticipants); // Сохраняем всех участников, отсортированных
			setParticipants(updatedParticipants); // Обновляем текущее состояние участников

			const responseCompetition = await api.get('/api/competition');
			setCompetitions(responseCompetition.data);

			// Извлекаем уникальные направления
			const uniqueTrends = new Set();
			responseDraw.data.forEach((item) => {
				if (
					item.participation &&
					item.participation.AthleteTrend &&
					item.participation.AthleteTrend.trends
				) {
					const trendName = item.participation.AthleteTrend.trends
						.split('(')[0]
						.trim(); // Отсекаем по скобке и обрезаем пробелы
					uniqueTrends.add(trendName);
				}
			});
			setTabTrends(Array.from(uniqueTrends)); // Преобразуем Set в массив и сохраняем в состояние
		} catch (error) {
			console.error('Ошибка при получении данных:', error);
		}
	};

	const fetchDataTabs = async () => {
		if (!selectedCompetition) {
			console.error('Соревнование не выбрано');
			return;
		}

		try {
			const responseParticipants = await api.get(
				`/api/comp-part/trends/${selectedCompetition}`
			);
			const uniqueTrends = new Set();
			responseParticipants.data.forEach((item) => {
				const trendName = item.AthleteTrend.trends.split('(')[0].trim(); // Отсекаем по скобке и обрезаем пробелы
				uniqueTrends.add(trendName);
			});
			setTabTrends(Array.from(uniqueTrends));
		} catch (error) {
			console.error('Ошибка при получении данных о направлениях:', error);
		}
	};

	const handleDraw = async () => {
		if (!selectedCompetition) {
			alert('Пожалуйста, выберите соревнование.');
			return;
		}

		try {
			const newDrawResponse = await api.post(
				`/api/draw-result/draw/${selectedCompetition}`
			);

			if (newDrawResponse.data && newDrawResponse.data.drawResults) {
				const participants = newDrawResponse.data.drawResults.map(
					(result) => ({
						...result,
						participation: result.participation,
					})
				);
				const sortedParticipants = participants.sort(
					(a, b) => a.performanceOrder - b.performanceOrder
				);

				setAllParticipants(sortedParticipants); // Обновляем всех участников
				setParticipants(sortedParticipants); // Обновляем текущих участников

				const trends = Array.from(
					new Set(
						participants.map((item) =>
							item.participation?.AthleteTrend?.trends
								.split('(')[0]
								.trim()
						)
					)
				);
				setTabTrends(trends); // Обновляем направления без скобок
			} else {
				console.error('Expected participants data is not available');
			}
		} catch (error) {
			console.error('Ошибка при проведении жеребьёвки:', error);
		}
	};

	// Функция для изменения порядка направлений
	const handleTrendOrderChange = (trend, position) => {
		let orderCopy = [...trendOrder];
		orderCopy = orderCopy.filter((item) => item.trend !== trend); // Убираем текущее направление, если оно уже есть
		orderCopy.push({ trend, position: parseInt(position) }); // Добавляем направление с новой позицией
		orderCopy.sort((a, b) => a.position - b.position); // Сортируем по позиции
		setTrendOrder(orderCopy);
		filterParticipantsByTrendOrder(orderCopy); // Фильтрация участников по новому порядку
	};

	// Функция для фильтрации и сортировки участников по выбранному порядку направлений
	const filterParticipantsByTrendOrder = (order) => {
		const orderedTrends = order.map((item) => item.trend);
		const filteredParticipants = allParticipants
			.filter((participant) =>
				orderedTrends.includes(
					participant.participation?.AthleteTrend?.trends
						.split('(')[0]
						.trim()
				)
			)
			.sort((a, b) => {
				const trendA = a.participation.AthleteTrend.trends
					.split('(')[0]
					.trim();
				const trendB = b.participation.AthleteTrend.trends
					.split('(')[0]
					.trim();
				const positionA = orderedTrends.indexOf(trendA);
				const positionB = orderedTrends.indexOf(trendB);
				return positionA - positionB;
			});
		setParticipants(filteredParticipants);
	};

	const handleTabClick = (selectedTrend) => {
		setActiveTrend(selectedTrend);
		// Фильтрация участников по направлению
		const filteredParticipants = allParticipants.filter(
			(participant) =>
				participant.participation &&
				participant.participation.AthleteTrend &&
				participant.participation.AthleteTrend.trends.startsWith(
					selectedTrend
				)
		);
		// Сортировка отфильтрованных участников
		const sortedFilteredParticipants = filteredParticipants.sort(
			(a, b) => a.performanceOrder - b.performanceOrder
		);
		setParticipants(sortedFilteredParticipants); // Обновляем список участников жеребьёвки для отображения
	};

	const resetFilter = () => {
		setActiveTrend(''); // Сброс активного направления
		setParticipants(allParticipants); // Восстановление списка всех участников
	};

	const calculateTotalScore = async (
		athleteId,
		competitionParticipationId
	) => {
		try {
			const [protocolData, exerciseData] = await Promise.all([
				fetchProtocolDetails(athleteId, competitionParticipationId),
				fetchExerciseProtocolDetails(competitionParticipationId),
			]);

			const protocolScores = protocolData.reduce((acc, detail) => {
				const protocolTypeId = detail.detail?.protocolTypeId;
				if (!acc[protocolTypeId]) {
					acc[protocolTypeId] = { score: 0, judges: new Set() };
				}
				acc[protocolTypeId].score += detail.score;
				acc[protocolTypeId].judges.add(detail.judgeId);
				return acc;
			}, {});

			const averageScores = Object.values(protocolScores).map(
				({ score, judges }) => score / judges.size
			);

			const exerciseScores = exerciseData.filter(
				(item) => item.result === 1
			).length;

			const totalAverageScore =
				averageScores.reduce((sum, avg) => sum + avg, 0) +
				exerciseScores;

			console.log('Вычисленный общий балл:', totalAverageScore);
			return totalAverageScore;
		} catch (error) {
			console.error('Ошибка при расчете общего балла:', error);
			return 0;
		}
	};

	const fetchProtocolDetails = async (
		athleteId,
		competitionParticipationId
	) => {
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

	const updateParticipantTotalScore = async (participantId, totalScore) => {
		try {
			await api.put(
				`/api/draw-result/update-total-score/${participantId}`,
				{
					totalScore,
				}
			);
			setParticipants((prevParticipants) =>
				prevParticipants.map((participant) =>
					participant.participation.id === participantId
						? { ...participant, totalScore }
						: participant
				)
			);
		} catch (error) {
			console.error('Ошибка при обновлении общего балла:', error);
		}
	};

	const dayColors = [
		'#F0F8FF', // Alice Blue
		'#FAEBD7', // Antique White
		'#F5F5DC', // Beige
		'#FFEFD5', // Papaya Whip
		'#FFF5EE', // SeaShell
		'#F5F5F5', // White Smoke
	];

	return (
		<div>
			<div className='tabs'>
				{tabTrends.map((trend, index) => (
					<button
						key={index}
						className={`tab-link ${
							trend === activeTrend ? 'active' : ''
						}`}
						onClick={() => handleTabClick(trend)}>
						{trend}
					</button>
				))}
				<button
					className='tab-link reset-button'
					onClick={resetFilter}>
					Скинути фільтр
				</button>
			</div>

			<div className='tab-content-container2'>
				<div className='table-container'>
					<table>
						<thead>
							<tr>
								<th>№</th>
								<th>Ім`я</th>
								<th>Розряд</th>
								<th>Вікова категорія</th>
								<th>Заг. балл</th>
							</tr>
						</thead>
						<tbody>
							{participants.map((participant, index) => (
								<tr
									key={participant.id}
									style={{
										backgroundColor:
											dayColors[
												(participant.competitionDay -
													1) %
													dayColors.length
											],
									}}>
									<td>{participant.performanceOrder}</td>

									<td>{`${participant.participation.Athlete?.firstName} ${participant.participation.Athlete?.lastName}`}</td>
									<td>
										{participant.participation.Level?.name}
									</td>
									<td>
										{
											participant.participation.AthleteAge
												.age
										}
									</td>
									<td>
										{/* {participant.totalScore}{' '} */}cc
										{/* Отображаем общую сумму баллов */}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default TimingHomePage;
