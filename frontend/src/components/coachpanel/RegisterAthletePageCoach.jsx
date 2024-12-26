import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/api';
import { AuthContext } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

// Предполагается, что внутри этих модалок вы тоже замените react-bootstrap на Ant Design
import AthleteRegistrationModal from '../modal/AthleteRegistrationModal';
import ExerciseDetailsModal from '../modal/ExerciseDetailsModal';
import UploadedFilesModal from '../modal/UploadedFilesModal';
import '../../styles/global.scss';

// Ant Design импорты
import { Table, Button, Row, Col, Typography, Grid, Layout } from 'antd';
import {
    FileTextOutlined,
    FileFilled,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
} from '@ant-design/icons';

const { Title } = Typography;
const { useBreakpoint } = Grid;

const RegisterAthletePageCoach = () => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);

    const [competitions, setCompetitions] = useState([]);
    const [athletes, setAthletes] = useState([]);
    const [athleteAge, setAthleteAge] = useState([]);
    const [athleteTrend, setAthleteTrend] = useState([]);
    const [participations, setParticipations] = useState([]);
    const [levels, setLevels] = useState([]);
    const [disciplines, setDisciplines] = useState([]);
    const [error, setError] = useState('');
    const [allExercises, setAllExercises] = useState([]);
    const [detailExercises, setDetailExercises] = useState([]);
    const [selectedParticipationDetails, setSelectedParticipationDetails] =
        useState(null);

    const [isRegistrationModalVisible, setIsRegistrationModalVisible] =
        useState(false);
    const [isFilesModalVisible, setIsFilesModalVisible] = useState(false);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

    const [editingParticipation, setEditingParticipation] = useState(null);
    const [coaches, setCoaches] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const [initialValues, setInitialValues] = useState({
        athleteId: '',
        competitionId: '',
        athleteAgeId: '',
        athleteTrendId: '',
        levelId: '',
        selectedExercises: [],
        disciplineId: '',
        uploadedFiles: [],
    });

    const [payCompetitions, setPayCompetitions] = useState({});

    // Для адаптивности antd
    const screens = useBreakpoint();

    useEffect(() => {
        loadInitialData();
        loadCoaches();
    }, []);

    useEffect(() => {
        loadParticipations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [participations.length]);

    const loadInitialData = async () => {
        try {
            const [
                competitionsResponse,
                athletesResponse,
                athleteAgeResponse,
                athleteTrendResponse,
                levelResponse,
                disciplineResponse,
                exercisesResponse,
                detailExercisesResponse,
            ] = await Promise.all([
                api.get('/api/competition'),
                api.get(`/api/athletes/by-coach/${user.userId}`),
                api.get('/api/athletes-age'),
                api.get('/api/athletes-trend'),
                api.get('/api/level'),
                api.get('/api/discipline'),
                api.get('/api/exercise'),
                api.get('/api/exercise-details'),
            ]);

            setCompetitions(competitionsResponse.data);
            setAthletes(athletesResponse.data);
            setAthleteAge(athleteAgeResponse.data);
            setAthleteTrend(athleteTrendResponse.data);
            setLevels(levelResponse.data);
            setDisciplines(disciplineResponse.data);
            setAllExercises(exercisesResponse.data);
            setDetailExercises(detailExercisesResponse.data);
        } catch (err) {
            console.error('Error loading All data:', err);
            setError('Failed to load initial data.');
        }
    };

    const loadCoaches = async () => {
        try {
            // В вашем случае один тренер = user
            const oneCoach = [user];
            setCoaches(oneCoach);
        } catch (err) {
            console.error('Error loading trainers:', err);
            setError('Failed to load trainers.');
        }
    };

    const handleRegister = async (formData) => {
        try {
            let response;
            if (editingParticipation) {
                response = await api.put(
                    `/api/comp-part/${editingParticipation.id}`,
                    formData
                );
                setParticipations((prev) =>
                    prev.map((item) =>
                        item.id === editingParticipation.id
                            ? response.data
                            : item
                    )
                );
            } else {
                await api.post('/api/comp-part', formData);
            }

            closeModal();
            // Обновим страницу или можно заново запросить loadParticipations()
            window.location.reload();
        } catch (err) {
            setError(
                err.response?.data.message ||
                    'An error occurred during registration'
            );
        }
    };

    const loadParticipations = async () => {
        try {
            const response = await api.get(
                `/api/comp-part/by-coach/${user.userId}`
            );
            const initialPayStatus = response.data.reduce((acc, part) => {
                acc[part.id] = part.isPaid;
                return acc;
            }, {});
            setPayCompetitions(initialPayStatus);
            setParticipations(response.data);
        } catch (err) {
            console.error('Error loading participants:', err);
            setError('Failed to load members.');
        }
    };

    const handleDeleteAthleteRegistration = async (participationId) => {
        if (window.confirm('Are you sure you want to remove this athlete?')) {
            try {
                await api.delete(`/api/comp-part/${participationId}`);
                loadParticipations();
            } catch (error) {
                console.error(
                    'Error when deleting competition participation',
                    error
                );
                setError(
                    error.response?.data.message ||
                        'An error occurred during deletion'
                );
            }
        }
    };

    const handleShowFiles = (uploadedFiles, participation) => {
        setSelectedFiles(uploadedFiles);
        setIsFilesModalVisible(true);
        setEditingParticipation(participation);
    };

    const closeFilesModal = () => {
        setIsFilesModalVisible(false);
        setSelectedFiles([]);
    };

    const handleDetailsClick = (participationId) => {
        setDetailExercises((currentDetails) => {
            const details = currentDetails.filter(
                (detail) =>
                    detail.competitionParticipationId === participationId
            );
            setSelectedParticipationDetails(details);
            setIsDetailsModalVisible(true);
            return currentDetails;
        });
    };

    const openEditModal = (participation) => {
        setEditingParticipation(participation);
        setInitialValues({
            athleteId: participation.athleteId || '',
            competitionId: participation.competitionId || '',
            athleteAgeId: participation.athleteAgeId || '',
            athleteTrendId: participation.athleteTrendId || '',
            levelId: participation.levelId || '',
            selectedExercises:
                participation.exercises?.map((ex) => ({
                    value: ex.id,
                    label: ex.name,
                })) || [],
            disciplineId: participation.disciplineId || '',
            uploadedFiles: participation.uploadedFiles || [],
        });
        setIsRegistrationModalVisible(true);
    };

    const closeModal = () => {
        setIsRegistrationModalVisible(false);
        resetForm();
    };

    const resetForm = () => {
        setInitialValues({
            athleteId: '',
            competitionId: '',
            athleteAgeId: '',
            athleteTrendId: '',
            levelId: '',
            selectedExercises: [],
            disciplineId: '',
            uploadedFiles: [],
        });
        setEditingParticipation(null);
    };

    // Сортировка регистраций по фамилии
    const sortParticipations = (participationsData) => {
        return participationsData.sort((a, b) => {
            const lastNameA = a.Athlete?.lastName?.toLowerCase() || '';
            const lastNameB = b.Athlete?.lastName?.toLowerCase() || '';
            if (lastNameA < lastNameB) return -1;
            if (lastNameA > lastNameB) return 1;
            return 0;
        });
    };

    const sortedParticipations = sortParticipations(participations);

    // Определяем колонки для антовской таблицы
    const columns = [
        {
            title: '№',
            key: 'index',
            render: (text, record, index) => index + 1,
            width: 60,
            // responsive: ["xs","sm","md","lg"] — можно добавить,
            // но по умолчанию колонка отображается на всех размерах
        },
        {
            title: t('table.athlete'),
            dataIndex: ['Athlete', 'lastName'],
            key: 'athlete',
            render: (lastName, record) => (
                <>
                    {record.Athlete?.lastName} {record.Athlete?.firstName}
                </>
            ),
        },
        {
            title: t('table.competition'),
            dataIndex: ['Competition', 'title'],
            key: 'competition',
        },
        {
            title: t('table.direction'),
            dataIndex: ['AthleteTrend', 'trends'],
            key: 'trend',
        },
        {
            title: t('table.age'),
            dataIndex: ['AthleteAge', 'age'],
            key: 'age',
            width: 100,
        },
        {
            title: t('table.actions'),
            key: 'actions',
            width: screens.xs ? 180 : 220,
            render: (text, participation) => {
                // Проверяем, есть ли у спортсмена файлы
                const hasFiles = participation.uploadedFiles?.length > 0;

                return (
                    <>
                        <Button
                            type="default"
                            icon={<FileTextOutlined />}
                            style={{ marginRight: 5, marginBottom: 5 }}
                            onClick={() => handleDetailsClick(participation.id)}
                        />
                        <Button
                            // Меняем цвет кнопки в зависимости от наличия файлов
                            type={hasFiles ? 'primary' : 'default'}
                            icon={<FileFilled />}
                            style={{ marginRight: 5, marginBottom: 5 }}
                            onClick={() =>
                                handleShowFiles(
                                    participation.uploadedFiles,
                                    participation
                                )
                            }
                        />
                        <Button
                            type="default"
                            icon={<EditOutlined />}
                            style={{ marginRight: 5, marginBottom: 5 }}
                            onClick={() => openEditModal(participation)}
                        />
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            style={{ marginBottom: 5 }}
                            onClick={() =>
                                handleDeleteAthleteRegistration(
                                    participation.id
                                )
                            }
                        />
                    </>
                );
            },
        },
    ];

    return (
        <Layout className="layout">
            <Row justify="center" style={{ marginBottom: 24 }}>
                <Col span={24} style={{ textAlign: 'center' }}>
                    <Title level={2}>{t('h1.athleteRegistration')}</Title>
                </Col>
                <Col style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsRegistrationModalVisible(true)}
                    >
                        {t('button.registrationNoun')}
                    </Button>
                </Col>
            </Row>

            {/* Модалка регистрации спортсмена/редактирования */}
            {isRegistrationModalVisible && (
                <AthleteRegistrationModal
                    isVisible={isRegistrationModalVisible}
                    onClose={() => setIsRegistrationModalVisible(false)}
                    onSubmit={handleRegister}
                    athletes={athletes}
                    competitions={competitions}
                    athleteTrend={athleteTrend}
                    athleteAge={athleteAge}
                    levels={levels}
                    disciplines={disciplines}
                    allExercises={allExercises}
                    editingParticipation={Boolean(editingParticipation)}
                    initialValues={initialValues}
                    t={t}
                />
            )}

            {/* Модалка деталей упражнений */}
            {isDetailsModalVisible && selectedParticipationDetails && (
                <ExerciseDetailsModal
                    isVisible={isDetailsModalVisible}
                    onClose={() => setIsDetailsModalVisible(false)}
                    selectedParticipationDetails={selectedParticipationDetails}
                    t={t}
                />
            )}

            {/* Модалка для просмотра/загрузки файлов */}
            <UploadedFilesModal
                isVisible={isFilesModalVisible}
                onClose={closeFilesModal}
                files={selectedFiles}
                editingParticipation={editingParticipation}
                t={t}
            />

            {/* Таблица регистраций */}
            <Table
                columns={columns}
                dataSource={sortedParticipations}
                rowKey="id"
                // Добавляем горизонтальный скролл для мобилок
                scroll={{ x: 600 }}
                // Выделение цветом оплаченных (пример)
                rowClassName={(record) =>
                    payCompetitions[record.id] ? 'paid-row' : ''
                }
                pagination={{
                    pageSize: 10, // размер страницы
                    responsive: true, // адаптивная пагинация
                    showSizeChanger: true, // пользователь может менять размер
                    pageSizeOptions: ['5', '10', '20', '50'],
                }}
            />
        </Layout>
    );
};

export default RegisterAthletePageCoach;
