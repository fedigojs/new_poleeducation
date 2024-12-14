import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/api';
import ModalVotingDetails from '../ModalVotingDetails';
import ModalVoting from '../ModalVoting';
import { AuthContext } from '../../context/AuthContext';
import '../adminpanel/AthletesDraw.css';

const AthletesInCompetitionCoach = () => {
    const [participants, setParticipants] = useState([]);
    const [tabTrends, setTabTrends] = useState([]);
    const [allParticipants, setAllParticipants] = useState([]);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isVotingModalOpen, setIsVotingModalOpen] = useState(false);
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchData();
    }, []);

    const openDetailsModal = (participant) => {
        setSelectedParticipant(participant);
        setIsDetailsModalOpen(true);
    };

    const closeDetailsModal = () => {
        setIsDetailsModalOpen(false);
    };

    const closeVotingModal = () => {
        setIsVotingModalOpen(false);
    };

    const fetchProtocolStatuses = async (participant) => {
        // Ваш код для получения статусов протоколов
    };

    const fetchData = async () => {
        try {
            const responseDraw = await api.get(
                `/api/draw-result/by-coach/${user.userId}`
            );
            // console.log(responseDraw.data);
            const sortedData = responseDraw.data.sort(
                (a, b) => a.performanceOrder - b.performanceOrder
            );

            const updatedParticipants = await Promise.all(
                sortedData.map(async (participant) => {
                    if (
                        !participant.participation ||
                        !participant.participation.athleteId
                    ) {
                        // console.error('Missing participant data:', participant);
                        return null; // Пропускаем этот элемент
                    }

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
            ).then((participants) =>
                participants.filter((participant) => participant !== null)
            ); // Удаляем null элементы

            setAllParticipants(updatedParticipants); // Сохраняем всех участников, отсортированных
            setParticipants(updatedParticipants); // Обновляем текущее состояние участников

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
                    judgeId={user.userId}
                />
            )}

            <div className="tab-content-container">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Ім`я</th>
                                <th>Напрям</th>
                                <th>Розряд</th>
                                <th>Вікова категорія</th>
                                <th>Дія</th>
                            </tr>
                        </thead>
                        <tbody>
                            {participants.map((participant, index) => {
                                if (
                                    !participant.participation ||
                                    !participant.participation.Athlete
                                ) {
                                    console.error(
                                        'Missing participant data:',
                                        participant
                                    );
                                    return null; // Пропускаем этот элемент, если данных нет
                                }

                                return (
                                    <tr key={participant.id}>
                                        <td>{`${participant.participation.Athlete.firstName} ${participant.participation.Athlete.lastName}`}</td>
                                        <td>
                                            {
                                                participant.participation
                                                    .AthleteTrend.trends
                                            }
                                        </td>
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

export default AthletesInCompetitionCoach;
