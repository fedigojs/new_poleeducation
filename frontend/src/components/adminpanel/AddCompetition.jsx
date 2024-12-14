import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Modal from '../Modal'; // Проверьте, что путь к модальному окну верный
import { Container } from 'react-bootstrap';

const AddCompetitionPage = () => {
    const [competitions, setCompetitions] = useState([]);
    const [title, setTitle] = useState('');
    const [dateOpen, setDateOpen] = useState('');
    const [dateClose, setDateClose] = useState('');
    const [location, setLocation] = useState('');
    const [endRegistration, setEndRegistration] = useState('');
    const [error, setError] = useState('');
    const [editingCompetition, setEditingCompetition] = useState(null);

    const [isModalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        loadCompetitions();
    }, []);

    const loadCompetitions = async () => {
        try {
            const response = await api.get('/api/competition');
            setCompetitions(response.data);
        } catch (err) {
            console.error('Ошибка при загрузке соревнований:', err);
            setError('Не удалось загрузить соревнования.');
        }
    };

    const handleSaveCompetition = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title,
                date_open: dateOpen,
                date_close: dateClose,
                location,
                display: endRegistration,
            };

            let response;
            // Если редактируем существующее соревнование
            if (editingCompetition) {
                response = await api.put(
                    `/api/competition/${editingCompetition.id}`,
                    payload
                );
            } else {
                // Добавляем новое соревнование
                response = await api.post('/api/competition', payload);
            }

            console.log('Соревнование успешно сохранено!');
            loadCompetitions();
            closeModal();
        } catch (err) {
            setError(
                err.response?.data.message || 'Произошла ошибка при сохранении'
            );
        }
    };

    const handleSelectCompetition = (competition) => {
        setEditingCompetition(competition);
        setModalVisible(true);
        setTitle(competition.title);
        setDateOpen(competition.date_open);
        setDateClose(competition.date_close);
        setLocation(competition.location);
        setEndRegistration(competition.display);
    };

    const handleDeleteCompetition = async (competitionId) => {
        if (
            window.confirm('Вы уверены, что хотите удалить это соревнование?')
        ) {
            try {
                await api.delete(`/api/competition/${competitionId}`);
                console.log('Соревнование успешно удалено!');
                setCompetitions(
                    competitions.filter((c) => c.id !== competitionId)
                );
            } catch (err) {
                console.error('Ошибка при удалении соревнования:', err);
                setError(
                    err.response?.data.message ||
                        'Произошла ошибка при удалении'
                );
            }
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingCompetition(null);
        // Очищаем форму
        setTitle('');
        setDateOpen('');
        setDateClose('');
        setLocation('');
    };

    return (
        <Container>
            <h1>Управление соревнованиями</h1>
            <button
                className="edit-button"
                onClick={() => {
                    setModalVisible(true);
                    setEditingCompetition(null);
                }}
            >
                Создать соревнование
            </button>

            {isModalVisible && (
                <Modal onClose={closeModal}>
                    <form
                        onSubmit={handleSaveCompetition}
                        className="competition-form"
                    >
                        <h3>
                            {editingCompetition ? 'Редактировать' : 'Добавить'}{' '}
                            соревнование
                        </h3>
                        <label htmlFor="title">
                            Название:
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </label>
                        <label htmlFor="dateOpen">
                            Дата начала:
                            <input
                                type="date"
                                id="dateOpen"
                                value={dateOpen}
                                onChange={(e) => setDateOpen(e.target.value)}
                                required
                            />
                        </label>
                        <label htmlFor="dateClose">
                            Дата окончания:
                            <input
                                type="date"
                                id="dateClose"
                                value={dateClose}
                                onChange={(e) => setDateClose(e.target.value)}
                                required
                            />
                        </label>
                        <label htmlFor="location">
                            Местоположение:
                            <input
                                type="text"
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                            />
                        </label>
                        <label htmlFor="endRegistration">
                            Запрет регистрации:
                            <select
                                id="endRegistration"
                                value={endRegistration}
                                onChange={(e) =>
                                    setEndRegistration(
                                        e.target.value === 'true'
                                    )
                                }
                                required
                            >
                                <option value="true">Нет</option>
                                <option value="false">Да</option>
                            </select>
                        </label>
                        <div className="form-actions">
                            <button type="submit">
                                {editingCompetition ? 'Сохранить' : 'Добавить'}
                            </button>
                            <button type="button" onClick={closeModal}>
                                Отмена
                            </button>
                        </div>
                        {error && <p className="error-message">{error}</p>}
                    </form>
                </Modal>
            )}
            {/* Код для таблицы соревнований по аналогии с атлетами... */}

            {/* Таблица соревнований */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Дата начала регистрации</th>
                            <th>Дата окончания регистрации</th>
                            <th>Местоположение</th>
                            <th>Запрет регистрации</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {competitions.map((competition) => (
                            <tr key={competition.id}>
                                <td>{competition.id}</td>
                                <td>{competition.title}</td>
                                <td>{competition.date_open}</td>
                                <td>{competition.date_close}</td>
                                <td>{competition.location}</td>
                                <td>{competition.display ? 'нет' : 'да'}</td>
                                <td>
                                    <button
                                        className="edit-button"
                                        onClick={() =>
                                            handleSelectCompetition(competition)
                                        }
                                    >
                                        Редактировать
                                    </button>
                                    <button
                                        className="delete-button"
                                        onClick={() =>
                                            handleDeleteCompetition(
                                                competition.id
                                            )
                                        }
                                    >
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Container>
    );
};

export default AddCompetitionPage;
