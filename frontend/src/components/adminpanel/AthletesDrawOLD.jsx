import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/api';
import ModalVotingDetails from '../ModalVotingDetails';
import ModalVoting from '../ModalVoting';
import './AthletesDraw.css';
import { AuthContext } from '../../context/AuthContext';
import { Container } from 'react-bootstrap';

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
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isVotingModalOpen, setIsVotingModalOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedCompetition) {
            fetchDataTabs();
        }
    }, [selectedCompetition]);

    const openDetailsModal = (participant) => {
        setSelectedParticipant(participant);
        setIsDetailsModalOpen(true);
    };

    const closeDetailsModal = () => {
        setIsDetailsModalOpen(false);
    };

    const openVotingModal = (participant) => {
        setSelectedParticipant(participant);
        setIsVotingModalOpen(true);
    };

    const closeVotingModal = () => {
        setIsVotingModalOpen(false);
    };

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

    const calculateTiming = async () => {
        if (!selectedCompetition) {
            alert('Please select a competition before calculating timings.');
            return;
        }

        let currentTime = new Date(`2024-01-01T${startTime}:00Z`);
        const endTimeOfDay = new Date(`2024-01-01T${endTime}:00Z`);
        const lunchStartTime = new Date(`2024-01-01T${lunchBreakStart}:00Z`);
        const lunchEndTime = new Date(`2024-01-01T${lunchBreakEnd}:00Z`);

        let currentDay = 1; // Начинаем с первого дня

        const updatedParticipants = participants.map((participant) => {
            // Обработка обеденного перерыва
            if (currentTime >= lunchStartTime && currentTime < lunchEndTime) {
                currentTime = new Date(lunchEndTime);
            }
            // Обработка окончания дня
            if (currentTime >= endTimeOfDay) {
                currentTime = new Date(`2024-01-01T${startTime}:00Z`);
                currentDay++; // Переход на следующий день
            }

            const timeStr = currentTime.toISOString().substring(11, 16);
            const dayStr = currentDay; // Отображение текущего дня

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

        setParticipants(updatedParticipants);
        console.log('Calculated timings:', updatedParticipants);

        // Обновление времени на сервере
        try {
            const response = await api.put(
                `/api/draw-result/update-timing/${selectedCompetition}`,
                updatedParticipants
            );
            if (response.status === 200) {
                console.log('Timings successfully updated:', response.data);
                const transformedData = response.data.results.map(
                    (item) => item[0]
                );
                setParticipants(transformedData);
            }
        } catch (error) {
            console.error('Error updating timings:', error);
        }
    };

    const deleteAllDrawResultsForCompetition = async (competitionId) => {
        try {
            const response = await api.delete(
                `/api/draw-result/delete/${competitionId}`
            );
            console.log(response.data.message); // Логирование сообщения об успешном удалении

            // Обновление состояния для удаления всех результатов жеребьёвки данного соревнования
            const updatedParticipants = allParticipants.filter(
                (participant) => participant.competitionId !== competitionId
            );
            setParticipants(updatedParticipants);
            setAllParticipants(updatedParticipants); // Обновляем состояние всех участников
        } catch (error) {
            console.error('Ошибка при удалении результатов жеребьёвки:', error);
            alert('Не удалось удалить результаты жеребьёвки: ' + error.message);
        }
    };

    const handleVoteSubmit = async (e) => {
        e.preventDefault(); // Предотвращаем стандартное поведение формы

        // Собираем данные из формы
        const formData = {
            athleteId: selectedParticipant.participation.Athlete.id,
            score: e.target.score.value, // Предполагаем, что у поля ввода оценки есть имя 'score'
            comment: e.target.comment.value, // Предполагаем, что у текстового поля комментария есть имя 'comment'
        };

        try {
            // Отправляем данные на сервер
            const response = await api.post('/api/voting', formData);
            if (response.status === 200) {
                console.log('Голос успешно зарегистрирован');
                // Здесь можно добавить дальнейшие действия, например, закрыть модальное окно
                closeVotingModal();
            } else {
                console.error('Ошибка при отправке данных', response);
            }
        } catch (error) {
            console.error('Ошибка при отправке данных', error);
        }
    };

    const handleUpdateScore = (participantId, newTotalScore) => {
        setParticipants((prevParticipants) =>
            prevParticipants.map((participant) =>
                participant.id === participantId
                    ? { ...participant, totalScore: newTotalScore }
                    : participant
            )
        );
    };

    const handleUpdateAllScores = async () => {
        try {
            const updatedParticipants = await Promise.all(
                participants.map(async (participant) => {
                    const totalScore = await calculateTotalScore(
                        participant.participation.athleteId,
                        participant.participation.id
                    );
                    await api.put(
                        `/api/draw-result/update-total-score/${participant.id}`,
                        {
                            totalScore,
                        }
                    );
                    return { ...participant, totalScore };
                })
            );
            setParticipants(updatedParticipants);
        } catch (error) {
            console.error(
                'Ошибка при обновлении totalScore для всех участников:',
                error
            );
        }
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
        <Container>
            <ModalVotingDetails
                isOpen={isDetailsModalOpen}
                onClose={closeDetailsModal}
                participant={selectedParticipant}
                onUpdateTotalScore={updateParticipantTotalScore}
                onUpdateScore={handleUpdateScore}
            />

            {user && (
                <ModalVoting
                    isOpen={isVotingModalOpen}
                    onClose={closeVotingModal}
                    participant={selectedParticipant}
                    onSubmit={handleVoteSubmit}
                    judgeId={user.userId} // Передаем judgeId в ModalVoting
                />
            )}

            <div className="container">
                <h1>Жеребкування спортсменів</h1>
                <div className="form-group">
                    <select
                        className="select-competition"
                        value={selectedCompetition}
                        onChange={(e) => setSelectedCompetition(e.target.value)}
                    >
                        <option value="">Виберіть змагання</option>
                        {competitions.map((competition) => (
                            <option key={competition.id} value={competition.id}>
                                {competition.title}
                            </option>
                        ))}
                    </select>
                    <button
                        className="edit-button"
                        onClick={() => {
                            handleDraw(selectedCompetition);
                        }}
                    >
                        Провести жеребкування
                    </button>
                    <button
                        className="delete-button"
                        onClick={() => {
                            deleteAllDrawResultsForCompetition(
                                selectedCompetition
                            );
                        }}
                    >
                        Видалити жеребкування
                    </button>
                </div>
                <div className="trend-container">
                    {tabTrends
                        .sort((a, b) => a.localeCompare(b)) // Сортировка строк в алфавитном порядке
                        .map((trend, index) => {
                            const trendName = trend.split('(')[0].trim();
                            return (
                                <div className="trend-item" key={index}>
                                    <label>{trendName}</label>
                                    <select
                                        value={
                                            trendOrder.find(
                                                (item) =>
                                                    item.trend === trendName
                                            )?.position || ''
                                        }
                                        onChange={(e) =>
                                            handleTrendOrderChange(
                                                trendName,
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">Встановити</option>
                                        {Array.from(
                                            { length: tabTrends.length },
                                            (_, i) => (
                                                <option key={i} value={i + 1}>
                                                    {i + 1}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>
                            );
                        })}
                </div>

                <div className="form-group">
                    <div className="row">
                        <div className="col">
                            <label htmlFor="start-time">Час початку:</label>
                            <input
                                id="start-time"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div className="col">
                            <label htmlFor="end-time">
                                Час закінчення дня:
                            </label>
                            <input
                                id="end-time"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                        <div className="col">
                            <label htmlFor="performance-duration">
                                Тривалість виступу (хв):
                            </label>
                            <input
                                id="performance-duration"
                                type="number"
                                value={performanceDuration}
                                onChange={(e) =>
                                    setPerformanceDuration(
                                        Number(e.target.value)
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col">
                            <label htmlFor="break-duration">
                                Тривалість перерви (хв):
                            </label>
                            <input
                                id="break-duration"
                                type="number"
                                value={breakDuration}
                                onChange={(e) =>
                                    setBreakDuration(Number(e.target.value))
                                }
                            />
                        </div>
                        <div className="col">
                            <label htmlFor="lunch-start-time">
                                Обідня перерва початок:
                            </label>
                            <input
                                id="lunch-start-time"
                                type="time"
                                value={lunchBreakStart}
                                onChange={(e) =>
                                    setLunchBreakStart(e.target.value)
                                }
                            />
                        </div>
                        <div className="col">
                            <label htmlFor="lunch-end-time">
                                Обідня перерва кінець:
                            </label>
                            <input
                                id="lunch-end-time"
                                type="time"
                                value={lunchBreakEnd}
                                onChange={(e) =>
                                    setLunchBreakEnd(e.target.value)
                                }
                            />
                        </div>
                    </div>
                </div>

                <button className="calculate-button" onClick={calculateTiming}>
                    Розрахувати таймінг
                </button>
            </div>

            <div className="tabs">
                {tabTrends.map((trend, index) => (
                    <button
                        key={index}
                        className={`tab-link ${
                            trend === activeTrend ? 'active' : ''
                        }`}
                        onClick={() => handleTabClick(trend)}
                    >
                        {trend}
                    </button>
                ))}
                <button className="tab-link reset-button" onClick={resetFilter}>
                    Скинути фільтр
                </button>
            </div>

            <button
                className="update-all-scores-button"
                onClick={handleUpdateAllScores}
            >
                Обновить Общий Балл для всех
            </button>

            <div className="tab-content-container">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>№</th>
                                <th>День</th>
                                <th>Таймінг</th>
                                <th>Ім`я</th>
                                <th>Розряд</th>
                                <th>Вікова категорія</th>
                                {/* <th>Заг. балл</th> */}
                                {/* <th>Протоколи</th> */}
                                <th>Дія</th>
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
                                    }}
                                >
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
                                    {/* <td>
										{participant.totalScore}{' '}
									</td> */}
                                    {/* <td>
										{participant.protocolStatuses &&
											participant.protocolStatuses.map(
												(status) => (
													<span
														key={
															status.protocolTypeId
														}
														className='protocol-status'>
														{status.isFilled
															? '❌'
															: '✔️'}
													</span>
												)
											)}
									</td> */}
                                    <td>
                                        <button
                                            className="detail-button"
                                            onClick={() =>
                                                openDetailsModal(participant)
                                            }
                                        >
                                            Детали
                                        </button>
                                        <button
                                            className="voting-button"
                                            onClick={() =>
                                                openVotingModal(participant)
                                            }
                                        >
                                            Голосование
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Container>
    );
};

export default AthletesDraw;
