import React, { useState, useEffect } from 'react';
import {
    Layout,
    Table,
    Button,
    Modal,
    Form,
    Input,
    DatePicker,
    Select,
    message,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import moment from 'moment';
import api from '../../api/api';
import '../../styles/global.scss';

const { Option } = Select;

const AddCompetitionPage = () => {
    const [competitions, setCompetitions] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingCompetition, setEditingCompetition] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadCompetitions();
    }, []);

    const loadCompetitions = async () => {
        try {
            const response = await api.get('/api/competition');
            setCompetitions(response.data);
        } catch (err) {
            message.error('Не удалось загрузить соревнования.');
        }
    };

    const handleSaveCompetition = async (values) => {
        try {
            const payload = {
                title: values.title,
                date_open: values.dateOpen.format('YYYY-MM-DD'),
                date_close: values.dateClose.format('YYYY-MM-DD'),
                location: values.location,
                display: values.endRegistration === 'true',
            };

            if (editingCompetition) {
                await api.put(
                    `/api/competition/${editingCompetition.id}`,
                    payload
                );
                message.success('Соревнование успешно обновлено!');
            } else {
                await api.post('/api/competition', payload);
                message.success('Соревнование успешно добавлено!');
            }

            loadCompetitions();
            closeModal();
        } catch (err) {
            message.error(
                err.response?.data.message || 'Произошла ошибка при сохранении.'
            );
        }
    };

    const handleDeleteCompetition = async (competitionId) => {
        try {
            await api.delete(`/api/competition/${competitionId}`);
            message.success('Соревнование успешно удалено!');
            setCompetitions(competitions.filter((c) => c.id !== competitionId));
        } catch (err) {
            message.error(
                err.response?.data.message || 'Произошла ошибка при удалении.'
            );
        }
    };

    const openModal = (competition = null) => {
        setEditingCompetition(competition);
        setModalVisible(true);
        if (competition) {
            form.setFieldsValue({
                title: competition.title,
                dateOpen: moment(competition.date_open, 'YYYY-MM-DD'), // Преобразование строки в Moment
                dateClose: moment(competition.date_close, 'YYYY-MM-DD'),
                location: competition.location,
                endRegistration: competition.display ? 'true' : 'false',
            });
        } else {
            form.resetFields();
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setEditingCompetition(null);
        form.resetFields();
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Название',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Дата начала',
            dataIndex: 'date_open',
            key: 'date_open',
        },
        {
            title: 'Дата окончания',
            dataIndex: 'date_close',
            key: 'date_close',
        },
        {
            title: 'Местоположение',
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: 'Запрет регистрации',
            dataIndex: 'display',
            key: 'display',
            render: (text) => (text ? 'нет' : 'да'),
        },
        {
            title: 'Действия',
            key: 'actions',
            render: (_, record) => (
                <>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => openModal(record)}
                    />
                    <Button
                        type="link"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDeleteCompetition(record.id)}
                    />
                </>
            ),
        },
    ];

    return (
        <Layout className="layout">
            <h1>Управление соревнованиями</h1>
            <Button
                className="global-button"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => openModal()}
            >
                Создать соревнование
            </Button>
            <Table dataSource={competitions} columns={columns} rowKey="id" />

            <Modal
                title={
                    editingCompetition
                        ? 'Редактировать соревнование'
                        : 'Добавить соревнование'
                }
                visible={isModalVisible}
                onCancel={closeModal}
                onOk={() => {
                    form.validateFields()
                        .then((values) => {
                            handleSaveCompetition(values);
                        })
                        .catch((info) => {
                            console.log('Validate Failed:', info);
                        });
                }}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="title"
                        label="Название"
                        rules={[
                            { required: true, message: 'Введите название!' },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="dateOpen"
                        label="Дата начала"
                        rules={[
                            { required: true, message: 'Введите дату начала!' },
                        ]}
                    >
                        <DatePicker format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item
                        name="dateClose"
                        label="Дата окончания"
                        rules={[
                            {
                                required: true,
                                message: 'Введите дату окончания!',
                            },
                        ]}
                    >
                        <DatePicker format="YYYY-MM-DD" />
                    </Form.Item>
                    <Form.Item
                        name="location"
                        label="Местоположение"
                        rules={[
                            {
                                required: true,
                                message: 'Введите местоположение!',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="endRegistration"
                        label="Запрет регистрации"
                        rules={[
                            { required: true, message: 'Выберите значение!' },
                        ]}
                    >
                        <Select>
                            <Option value="true">Нет</Option>
                            <Option value="false">Да</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default AddCompetitionPage;
