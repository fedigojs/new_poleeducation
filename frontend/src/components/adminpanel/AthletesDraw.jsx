import { useState, useEffect } from 'react';
import api from '../../api/api';
import './AthletesDraw.css';
import { Layout } from 'antd';
import Spinner from '../Spinner/Spinner';
import CustomTable from '../Table/customTable';
import '../../styles/global.scss';

const AthletesDraw = () => {
	const [participants, setParticipants] = useState([]);
	const [competitions, setCompetitions] = useState([]);
	const [tabTrends, setTabTrends] = useState([]);
	const [allParticipants, setAllParticipants] = useState([]);
	const [trendOrder, setTrendOrder] = useState([]);
	const [selectedCompetition, setSelectedCompetition] = useState('');
	const [activeTrend, setActiveTrend] = useState('');
	const [startTime, setStartTime] = useState('09:00');
	const [performanceDuration, setPerformanceDuration] = useState(5);
	const [breakDuration, setBreakDuration] = useState(1);
	const [lunchBreakStart, setLunchBreakStart] = useState('12:00');
	const [lunchBreakEnd, setLunchBreakEnd] = useState('13:00');
	const [endTime, setEndTime] = useState('19:00');
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		if (selectedCompetition) {
			fetchDataTabs();
		}
	}, [selectedCompetition]);

	const fetchData = async () => {
		setLoading(true);
		try {
			const responseDraw = await api.get('/api/draw-result');
			const sortedData = responseDraw.data.sort(
				(a, b) => a.performanceOrder - b.performanceOrder
			);

			setAllParticipants(sortedData); // Сохраняем всех участников, отсортированных
			setParticipants(sortedData); // Обновляем текущее состояние участников

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
		} finally {
			setLoading(false);
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


	const handleDrawAndTiming = async () => {
		if (!selectedCompetition) {
			alert('Будь ласка, виберіть змагання.');
			return;
		}

		setLoading(true);
		try {
			// Сначала проводим жеребьевку
			await api.post(`/api/draw-result/draw/${selectedCompetition}`);

			// Перезагружаем данные чтобы получить участников
			await fetchData();

			// Применяем порядок направлений перед расчетом тайминга
			let participantsForTiming = [...allParticipants];

			if (trendOrder.length > 0) {
				// Сортируем участников согласно выбранному порядку направлений
				const orderedTrends = trendOrder.map((item) => item.trend);
				participantsForTiming = participantsForTiming.sort((a, b) => {
					const trendA = a.participation.AthleteTrend.trends
						.split('(')[0]
						.trim();
					const trendB = b.participation.AthleteTrend.trends
						.split('(')[0]
						.trim();
					const positionA = orderedTrends.indexOf(trendA);
					const positionB = orderedTrends.indexOf(trendB);

					if (positionA !== -1 && positionB !== -1) {
						return positionA - positionB;
					} else if (positionA !== -1) {
						return -1;
					} else if (positionB !== -1) {
						return 1;
					}
					return a.performanceOrder - b.performanceOrder;
				});

				// Обновляем performanceOrder
				participantsForTiming = participantsForTiming.map((p, index) => ({
					...p,
					performanceOrder: index + 1,
				}));

				// Сохраняем обновленный порядок
				setAllParticipants(participantsForTiming);
				setParticipants(participantsForTiming);
			}

			// Затем автоматически рассчитываем тайминг
			await calculateTimingInternal(participantsForTiming);

			alert('Жеребкування та таймінг успішно розраховані');
		} catch (error) {
			console.error('Помилка:', error);
			alert('Не вдалося виконати операцію: ' + error.message);
		} finally {
			setLoading(false);
		}
	};

	const calculateTimingInternal = async (participantsData = null) => {
		if (!selectedCompetition) {
			return;
		}

		const dataToUse = participantsData || participants;

		let currentTime = new Date(`2024-01-01T${startTime}:00Z`);
		const endTimeOfDay = new Date(`2024-01-01T${endTime}:00Z`);
		const lunchStartTime = new Date(`2024-01-01T${lunchBreakStart}:00Z`);
		const lunchEndTime = new Date(`2024-01-01T${lunchBreakEnd}:00Z`);

		let currentDay = 1;

		const updatedParticipants = dataToUse.map((participant) => {
			if (currentTime >= lunchStartTime && currentTime < lunchEndTime) {
				currentTime = new Date(lunchEndTime);
			}
			if (currentTime >= endTimeOfDay) {
				currentTime = new Date(`2024-01-01T${startTime}:00Z`);
				currentDay++;
			}

			const timeStr = currentTime.toISOString().substring(11, 16);
			const dayStr = currentDay;

			currentTime = new Date(
				currentTime.getTime() +
					(performanceDuration + breakDuration) * 60000
			);

			return {
				...participant,
				timing: timeStr,
				competitionDay: dayStr,
			};
		});

		await api.put(
			`/api/draw-result/update-timing/${selectedCompetition}`,
			updatedParticipants
		);
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

	const calculateTiming = async () => {
		if (!selectedCompetition) {
			alert('Будь ласка, виберіть змагання.');
			return;
		}

		setLoading(true);
		try {
			await calculateTimingInternal();
			await fetchData();
			alert('Таймінг успішно перераховано');
		} catch (error) {
			console.error('Error updating timings:', error);
			alert('Не вдалося розрахувати таймінг: ' + error.message);
		} finally {
			setLoading(false);
		}
	};

	const deleteAllDrawResultsForCompetition = async (competitionId) => {
		try {
			const response = await api.delete(
				`/api/draw-result/delete/${competitionId}`
			);
			console.log(response.data.message); // Логирование сообщения об успешном удалении

			// Полностью перезагружаем данные с сервера
			await fetchData();

			alert('Результаты жеребьёвки успешно удалены');
		} catch (error) {
			console.error('Ошибка при удалении результатов жеребьёвки:', error);
			alert('Не удалось удалить результаты жеребьёвки: ' + error.message);
		}
	};

	// const calculateTotalScore = async (
	// 	athleteId,
	// 	competitionParticipationId
	// ) => {
	// 	try {
	// 		const [protocolData, exerciseData] = await Promise.all([
	// 			fetchProtocolDetails(athleteId, competitionParticipationId),
	// 			fetchExerciseProtocolDetails(competitionParticipationId),
	// 		]);

	// 		const protocolScores = protocolData.reduce((acc, detail) => {
	// 			const protocolTypeId = detail.detail?.protocolTypeId;
	// 			if (!acc[protocolTypeId]) {
	// 				acc[protocolTypeId] = { score: 0, judges: new Set() };
	// 			}
	// 			acc[protocolTypeId].score += detail.score;
	// 			acc[protocolTypeId].judges.add(detail.judgeId);
	// 			return acc;
	// 		}, {});

	// 		const averageScores = Object.values(protocolScores).map(
	// 			({ score, judges }) => score / judges.size
	// 		);

	// 		const exerciseScores = exerciseData.filter(
	// 			(item) => item.result === 1
	// 		).length;

	// 		const totalAverageScore =
	// 			averageScores.reduce((sum, avg) => sum + avg, 0) +
	// 			exerciseScores;

	// 		console.log('Вычисленный общий балл:', totalAverageScore);
	// 		return totalAverageScore;
	// 	} catch (error) {
	// 		console.error('Ошибка при расчете общего балла:', error);
	// 		return 0;
	// 	}
	// };

	// const fetchProtocolDetails = async (
	// 	athleteId,
	// 	competitionParticipationId
	// ) => {
	// 	try {
	// 		const response = await api.get(
	// 			`/api/protocol-result/athlete/${athleteId}/participation/${competitionParticipationId}`
	// 		);
	// 		return response.data;
	// 	} catch (error) {
	// 		console.error('Ошибка при получении данных протокола:', error);
	// 		return [];
	// 	}
	// };

	// const fetchExerciseProtocolDetails = async (competitionParticipationId) => {
	// 	try {
	// 		const response = await api.get(
	// 			`/api/protocol-exercise-result/participation/${competitionParticipationId}`
	// 		);
	// 		return response.data.exercises || [];
	// 	} catch (error) {
	// 		console.error(
	// 			'Ошибка при получении данных протокола упражнений:',
	// 			error
	// 		);
	// 		return [];
	// 	}
	// };

	const columns = [
		{
			title: '№',
			dataIndex: 'performanceOrder',
			key: 'performanceOrder',
		},
		{
			title: 'День',
			dataIndex: 'competitionDay',
			key: 'competitionDay',
			render: (day) => `${day} день`,
		},
		{
			title: 'Тайминг',
			dataIndex: 'timing',
			key: 'timing',
		},
		{
			title: 'Имя',
			dataIndex: ['participation', 'Athlete'],
			key: 'athleteName',
			render: (athlete) =>
				`${athlete?.firstName || ''} ${athlete?.lastName || ''}`,
		},
		{
			title: 'AthleteTrend',
			dataIndex: ['participation', 'AthleteTrend', 'trends'],
			key: 'athleteTrendName',
		},
		{
			title: 'Разряд',
			dataIndex: ['participation', 'Level', 'name'],
			key: 'level',
		},
		{
			title: 'Возрастная категория',
			dataIndex: ['participation', 'AthleteAge', 'age'],
			key: 'ageCategory',
		},
	];

	return (
		<Layout className='layout'>
			{loading ? (
				<div style={{ textAlign: 'center', padding: '20px' }}>
					<Spinner />
				</div>
			) : (
				<>
					<div className='container'>
						<h1>Жеребкування спортсменів</h1>
						<div className='form-group'>
							<select
								className='select-competition'
								value={selectedCompetition}
								onChange={(e) =>
									setSelectedCompetition(e.target.value)
								}>
								<option value=''>Виберіть змагання</option>
								{competitions.map((competition) => (
									<option
										key={competition.id}
										value={competition.id}>
										{competition.title}
									</option>
								))}
							</select>
						</div>

						{selectedCompetition && tabTrends.length > 0 && (
							<>
								<div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
									<h3 style={{ marginTop: 0 }}>Налаштування порядку напрямків</h3>
									<p style={{ margin: '10px 0', color: '#666', fontSize: '14px' }}>
										Встановіть порядок виходу напрямків. Це вплине на порядок виступів у жеребкуванні.
									</p>
									<div className='trend-container'>
										{tabTrends
											.sort((a, b) => a.localeCompare(b))
											.map((trend, index) => {
												const trendName = trend
													.split('(')[0]
													.trim();
												return (
													<div
														className='trend-item'
														key={index}>
														<label>{trendName}</label>
														<select
															value={
																trendOrder.find(
																	(item) =>
																		item.trend ===
																		trendName
																)?.position || ''
															}
															onChange={(e) =>
																handleTrendOrderChange(
																	trendName,
																	e.target.value
																)
															}>
															<option value=''>
																Встановити
															</option>
															{Array.from(
																{
																	length: tabTrends.length,
																},
																(_, i) => (
																	<option
																		key={i}
																		value={i + 1}>
																		{i + 1}
																	</option>
																)
															)}
														</select>
													</div>
												);
											})}
									</div>
								</div>

								<div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
									<h3 style={{ marginTop: 0 }}>Налаштування таймінгу</h3>
									<div className='form-group'>
										<div className='row'>
											<div className='col'>
												<label htmlFor='start-time'>
													Час початку:
												</label>
												<input
													id='start-time'
													type='time'
													value={startTime}
													onChange={(e) =>
														setStartTime(e.target.value)
													}
												/>
											</div>
											<div className='col'>
												<label htmlFor='end-time'>
													Час закінчення дня:
												</label>
												<input
													id='end-time'
													type='time'
													value={endTime}
													onChange={(e) =>
														setEndTime(e.target.value)
													}
												/>
											</div>
											<div className='col'>
												<label htmlFor='performance-duration'>
													Тривалість виступу (хв):
												</label>
												<input
													id='performance-duration'
													type='number'
													value={performanceDuration}
													onChange={(e) =>
														setPerformanceDuration(
															Number(e.target.value)
														)
													}
												/>
											</div>
										</div>

										<div className='row'>
											<div className='col'>
												<label htmlFor='break-duration'>
													Тривалість перерви (хв):
												</label>
												<input
													id='break-duration'
													type='number'
													value={breakDuration}
													onChange={(e) =>
														setBreakDuration(
															Number(e.target.value)
														)
													}
												/>
											</div>
											<div className='col'>
												<label htmlFor='lunch-start-time'>
													Обідня перерва початок:
												</label>
												<input
													id='lunch-start-time'
													type='time'
													value={lunchBreakStart}
													onChange={(e) =>
														setLunchBreakStart(e.target.value)
													}
												/>
											</div>
											<div className='col'>
												<label htmlFor='lunch-end-time'>
													Обідня перерва кінець:
												</label>
												<input
													id='lunch-end-time'
													type='time'
													value={lunchBreakEnd}
													onChange={(e) =>
														setLunchBreakEnd(e.target.value)
													}
												/>
											</div>
										</div>
									</div>
								</div>
							</>
						)}

						{participants.length > 0 && (
							<>
								<div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
									<button
										className='calculate-button'
										onClick={calculateTiming}>
										Перерахувати таймінг
									</button>
									<button
										className='delete-button'
										onClick={() => {
											deleteAllDrawResultsForCompetition(
												selectedCompetition
											);
										}}>
										Видалити жеребкування
									</button>
								</div>
							</>
						)}

						{!selectedCompetition && (
							<div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
								<p style={{ fontSize: '16px' }}>Виберіть змагання для початку роботи</p>
							</div>
						)}

						{selectedCompetition && participants.length === 0 && (
							<>
								<div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff3cd', borderRadius: '8px', marginTop: '20px' }}>
									<p style={{ fontSize: '16px', color: '#856404', margin: 0, marginBottom: '15px' }}>
										Немає учасників жеребкування. Натисніть кнопку нижче, щоб провести жеребкування та розрахувати таймінг.
									</p>
								</div>
								<div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
									<button
										className='edit-button'
										onClick={handleDrawAndTiming}>
										Провести жеребкування та розрахувати таймінг
									</button>
								</div>
							</>
						)}
					</div>

					{participants.length > 0 && (
						<>
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

							<CustomTable
								dataSource={participants}
								columns={columns}
								rowKey='id'
								pagination={{ pageSize: 100 }}
								style={{ marginTop: 0 }}
							/>
						</>
					)}
				</>
			)}
		</Layout>
	);
};

export default AthletesDraw;
