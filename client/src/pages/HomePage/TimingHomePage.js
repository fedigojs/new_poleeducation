import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import './ContentHomePage.css';

const TimingHomePage = () => {
	const [participants, setParticipants] = useState([]);
	const [competitions, setCompetitions] = useState([]);
	const [tabTrends, setTabTrends] = useState([]);
	const [allParticipants, setAllParticipants] = useState([]);

	const [selectedCompetition, setSelectedCompetition] = useState('');
	const [activeTrend, setActiveTrend] = useState('');

	useEffect(() => {
		fetchData();
	}, []);

	useEffect(() => {
		fetchDataTabs();
	}, []);

	const fetchData = async () => {
		try {
			const responseDraw = await api.get('/api/draw-result');
			const sortedData = responseDraw.data.sort(
				(a, b) => a.performanceOrder - b.performanceOrder
			);

			setAllParticipants(sortedData); // Сохраняем всех участников, отсортированных
			setParticipants(sortedData);

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
				uniqueTrends.add(item.AthleteTrend.trends); // Предполагается, что trends это поле в AthleteTrend
			});
			console.log(uniqueTrends);
			setTabTrends(Array.from(uniqueTrends));
		} catch (error) {
			console.error('Ошибка при получении данных о направлениях:', error);
		}
	};

	const handleTabClick = (selectedTrend) => {
		console.log('Выбрано направление:', selectedTrend);
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

	const dayColors = [
		'#F0F8FF', // Alice Blue
		'#FAEBD7', // Antique White
		'#F5F5DC', // Beige
		'#FFEFD5', // Papaya Whip
		'#FFF5EE', // SeaShell
		'#F5F5F5', // White Smoke
	];

	return (
		<div className='container'>
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
					className='tab-link reset-button' // Дополнительный стиль можно добавить если нужно
					onClick={resetFilter}>
					Сбросить фильтр
				</button>
			</div>

			<div className='tab-content-container'>
				<dir className='table-container'>
					<table>
						<thead>
							<tr>
								<th>№</th>
								<th>День</th>
								<th>Тайминг</th>
								<th>Имя</th>
								<th>Розряд</th>
								<th>Возрастная категория</th>
								<th>Заг. балл</th>
								<th>Оценено гол. суд.</th>
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
									<td>{participant.competitionDay} день</td>
									<td>{participant.timing}</td>

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
										{/* Заг. балл может быть добавлен здесь если доступен в данных */}
									</td>
									<td>
										{/* Оценено гол. суд. может быть добавлено здесь если доступно в данных */}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</dir>
			</div>
		</div>
	);
};

export default TimingHomePage;
