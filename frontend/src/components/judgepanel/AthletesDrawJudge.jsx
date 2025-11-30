import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/api';
import ModalVotingDetails from '../ModalVotingDetails';
import ModalVoting from '../ModalVoting';
import { AuthContext } from '../../context/AuthContext'; // Убедитесь, что путь к AuthContext корректен
import '../adminpanel/AthletesDraw.css';

const AthletesDrawJudge = () => {
    const [participants, setParticipants] = useState([]);
    const [competitions, setCompetitions] = useState([]);
    const [tabTrends, setTabTrends] = useState([]);
    const [allParticipants, setAllParticipants] = useState([]);
    const [trendOrder, setTrendOrder] = useState([]);
    const [selectedCompetition, setSelectedCompetition] = useState('');
    const [activeTrend, setActiveTrend] = useState('');
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isVotingModalOpen, setIsVotingModalOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const { user } = useContext(AuthContext); // Получаем пользователя из контекста

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

    const closeDetailsModal = async () => {
        setIsDetailsModalOpen(false);
        const currentTrend = activeTrend;
        // Обновляем данные после закрытия деталей
        await fetchData();
        // Применяем фильтр заново, если был активный тренд
        if (currentTrend) {
            setTimeout(() => {
                handleTabClick(currentTrend);
            }, 100);
        }
    };

    const openVotingModal = (participant) => {
        setSelectedParticipant(participant);
        setIsVotingModalOpen(true);
    };

    const closeVotingModal = async () => {
        setIsVotingModalOpen(false);
        const currentTrend = activeTrend;
        // Обновляем данные после голосования
        await fetchData();
        // Применяем фильтр заново, если был активный тренд
        if (currentTrend) {
            // Используем setTimeout чтобы дать React обновить state после fetchData
            setTimeout(() => {
                handleTabClick(currentTrend);
            }, 100);
        }
    };

    const fetchProtocolStatuses = async (participant) => {
        const { athleteId, competitionParticipationId } = participant;

        if (!athleteId || !competitionParticipationId) {
            console.error('Missing athleteId или competitionParticipationId');
            return [];
        }

        try {
            const response = await api.get(
                `/api/protocol-result/athlete/${athleteId}/participation/${competitionParticipationId}`
            );

            if (response.data && response.data.length > 0) {
                const uniqueJudges = new Set();
                return response.data
                    .filter((result) => {
                        if (!uniqueJudges.has(result.judgeId)) {
                            uniqueJudges.add(result.judgeId);
                            return true;
                        }
                        return false;
                    })
                    .map((result) => ({
                        protocolTypeId: result.protocolTypeId,
                        isFilled: result.isFilled,
                        judgeId: result.judgeId,
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

                    return {
                        ...participant,
                        protocolStatuses,
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
            <ModalVotingDetails
                isOpen={isDetailsModalOpen}
                onClose={closeDetailsModal}
                participant={selectedParticipant}
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
                <button
                    className="tab-link reset-button" // Дополнительный стиль можно добавить если нужно
                    onClick={resetFilter}
                >
                    Скинути фільтр
                </button>
            </div>

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
                                <th>Протоколи</th>
                                <th>Дія</th>
                            </tr>
                        </thead>
                        <tbody>
                            {participants.map((participant, index) => {
                                const seenJudges = new Set();
                                return (
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
                                        <td>
                                            {participant.competitionDay} день
                                        </td>
                                        <td>{participant.timing}</td>
                                        <td>{`${participant.participation.Athlete?.firstName} ${participant.participation.Athlete?.lastName}`}</td>
                                        <td>
                                            {
                                                participant.participation.Level
                                                    ?.name
                                            }
                                        </td>
                                        <td>
                                            {
                                                participant.participation
                                                    .AthleteAge.age
                                            }
                                        </td>
                                        <td>
                                            {participant.protocolStatuses &&
                                                participant.protocolStatuses.map(
                                                    (status) => {
                                                        if (
                                                            !seenJudges.has(
                                                                status.judgeId
                                                            )
                                                        ) {
                                                            seenJudges.add(
                                                                status.judgeId
                                                            );
                                                            return (
                                                                <span
                                                                    key={`${status.protocolTypeId}-${status.judgeId}`}
                                                                    className="protocol-status"
                                                                >
                                                                    {status.isFilled &&
                                                                    status.judgeId ===
                                                                        user.userId
                                                                        ? '❌'
                                                                        : '✔️'}
                                                                </span>
                                                            );
                                                        }
                                                        return null;
                                                    }
                                                )}
                                        </td>
                                        <td>
                                            <button
                                                className="detail-button"
                                                onClick={() =>
                                                    openDetailsModal(
                                                        participant
                                                    )
                                                }
                                            >
                                                Деталі
                                            </button>
                                            <button
                                                className="voting-button"
                                                onClick={() =>
                                                    openVotingModal(participant)
                                                }
                                            >
                                                Голосування
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AthletesDrawJudge;
