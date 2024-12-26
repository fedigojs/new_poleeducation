import React, { useState, useEffect, useMemo, useContext } from 'react';
import api from '../../api/api';
import AddAthleteCoachModal from '../modal/AddAthleteCoachModal';
import { AuthContext } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

// Антовские компоненты
import {
    Button,
    Table,
    Modal,
    Form,
    Input,
    Row,
    Col,
    Typography,
    Space,
    Alert,
    Layout,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AddAthleteCoach = () => {
    const { t } = useTranslation();
    const { user } = useContext(AuthContext);

    const [athletes, setAthletes] = useState([]);
    const [coaches, setCoaches] = useState([]);
    const [selectedAthlete, setSelectedAthlete] = useState(null);

    // ФИО спортсмена, которое редактируем
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const [error, setError] = useState('');

    // Управляемое состояние для видимости модалок
    const [isAddAthleteModalVisible, setAddAthleteModalVisible] =
        useState(false);
    const [isEditAthleteModalVisible, setEditAthleteModalVisible] =
        useState(false);

    // Сортировка по имени (asc / desc)
    const [sortDirection, setSortDirection] = useState('asc');

    const coachRoleId = 2; // как у вас в коде

    useEffect(() => {
        loadCoaches();
        loadAthletes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadAthletes = async () => {
        try {
            const response = await api.get(
                `/api/athletes/by-coach/${user.userId}`
            );
            setAthletes(response.data);
        } catch (err) {
            console.error('Error loading athletes:', err);
            setError('Failed to load athletes');
        }
    };

    const loadCoaches = async () => {
        try {
            const responseCoach = await api.get(`/api/users/${user.userId}`);
            setCoaches(responseCoach.data);
        } catch (err) {
            console.error('Error loading trainers:', err);
            setError('Failed to load trainers.');
        }
    };

    // Добавление нового спортсмена
    const handleAddAthleteSubmit = async ({ firstName, lastName }) => {
        try {
            const coachId = Number(user.userId);
            await api.post('/api/athletes', {
                firstName,
                lastName,
                coachId,
            });
            loadAthletes();
            closeModals();
        } catch (err) {
            setError('An error occurred while adding an athlete.');
        }
    };

    // Обновление спортсмена (вызов при сабмите формы редактирования)
    const handleUpdateAthlete = async () => {
        if (!selectedAthlete) {
            setError('Select an athlete to change.');
            return;
        }
        try {
            await api.put(`/api/athletes/${selectedAthlete.id}`, {
                firstName,
                lastName,
                coachId: user.id, // возможно у вас user.id или user.userId
            });
            loadAthletes();
            closeModals();
        } catch (err) {
            setError('An error occurred while updating athlete data.');
        }
    };

    // Выбрали спортсмена для редактирования
    const handleSelectAthlete = (athlete) => {
        setSelectedAthlete(athlete);
        setFirstName(athlete.firstName);
        setLastName(athlete.lastName);
        setEditAthleteModalVisible(true);
    };

    const handleDeleteAthlete = async (athleteId) => {
        Modal.confirm({
            title: 'Confirm',
            content: t('confirm.removeAthlete'),
            onOk: async () => {
                try {
                    await api.delete(`/api/athletes/${athleteId}`);
                    loadAthletes();
                } catch (err) {
                    console.error('Error deleting athlete:', err);
                    setError('An error occurred when deleting an athlete.');
                }
            },
        });
    };

    // Закрываем все модалки и обнуляем стейт
    const closeModals = () => {
        setAddAthleteModalVisible(false);
        setEditAthleteModalVisible(false);
        setSelectedAthlete(null);
        setFirstName('');
        setLastName('');
    };

    // Сортируем по ФИО
    const sortedAthletes = useMemo(() => {
        return [...athletes].sort((a, b) => {
            const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
            const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
            if (nameA < nameB) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (nameA > nameB) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [athletes, sortDirection]);

    const handleSortByName = () => {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };

    // Подготовим колонки для Ant Design Table
    const columns = [
        {
            title: '№',
            key: 'index',
            width: 60,
            render: (_text, _record, index) => index + 1,
        },
        {
            title: (
                <div onClick={handleSortByName} style={{ cursor: 'pointer' }}>
                    {t('table.pib')}
                </div>
            ),
            dataIndex: 'fullName',
            key: 'fullName',
            render: (_text, record) => `${record.lastName} ${record.firstName}`,
        },
        {
            title: t('table.actions'),
            key: 'actions',
            width: 150,
            render: (_text, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleSelectAthlete(record)}
                    />
                    <Button
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDeleteAthlete(record.id)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <Layout className="layout">
            <Row justify="center" style={{ marginBottom: 24 }}>
                <Col span={24}>
                    <Title level={2} style={{ textAlign: 'center' }}>
                        {t('h1.athleteManagement')}
                    </Title>
                </Col>
            </Row>

            {/* Кнопка "Добавить" */}
            <Row justify="center" style={{ marginBottom: 16 }}>
                <Col>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setAddAthleteModalVisible(true)}
                    >
                        {t('button.addParticipant')}
                    </Button>
                </Col>
            </Row>

            {/* Сообщение об ошибке, если есть */}
            {error && (
                <Row justify="center" style={{ marginBottom: 16 }}>
                    <Col>
                        <Alert
                            message="Error"
                            description={error}
                            type="error"
                            showIcon
                            closable
                            onClose={() => setError('')}
                        />
                    </Col>
                </Row>
            )}

            {/* Таблица с данными */}
            <Row>
                <Col span={24}>
                    <Table
                        columns={columns}
                        dataSource={sortedAthletes}
                        rowKey="id"
                        // Горизонтальный скролл — если колонок станет много
                        scroll={{ x: 600 }}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            pageSizeOptions: ['5', '10', '20', '50'],
                        }}
                    />
                </Col>
            </Row>

            {/* Модалка "Добавить спортсмена" (логика внутри AddAthleteCoachModal, перепишите её на antd при необходимости) */}
            {isAddAthleteModalVisible && (
                <AddAthleteCoachModal
                    isVisible={isAddAthleteModalVisible}
                    onClose={closeModals}
                    onSubmit={handleAddAthleteSubmit}
                    coaches={user}
                    coachRoleId={coachRoleId}
                />
            )}

            {/* Модалка "Редактировать спортсмена" */}
            <Modal
                visible={isEditAthleteModalVisible}
                onCancel={closeModals}
                footer={null}
                centered
            >
                <Title level={4} style={{ marginBottom: 24 }}>
                    {t('modal.title.editAthlete')}
                </Title>

                <Form
                    layout="vertical"
                    onFinish={handleUpdateAthlete}
                    // Связываем поля формы со стейтом
                    fields={[
                        { name: ['firstName'], value: firstName },
                        { name: ['lastName'], value: lastName },
                    ]}
                >
                    <Form.Item
                        label={t('label.firstName')}
                        name="firstName"
                        rules={[
                            {
                                required: true,
                                message: t('validation.required'),
                            },
                        ]}
                    >
                        <Input onChange={(e) => setFirstName(e.target.value)} />
                    </Form.Item>

                    <Form.Item
                        label={t('label.lastName')}
                        name="lastName"
                        rules={[
                            {
                                required: true,
                                message: t('validation.required'),
                            },
                        ]}
                    >
                        <Input onChange={(e) => setLastName(e.target.value)} />
                    </Form.Item>

                    <Form.Item style={{ textAlign: 'right' }}>
                        <Button type="primary" htmlType="submit">
                            {t('button.edit')}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default AddAthleteCoach;
