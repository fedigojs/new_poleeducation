import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, message, Popconfirm, Layout } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import CustomTable from '../Table/customTable';
import api from '../../api/api';
import '../../styles/global.scss';

const { Option } = Select;

const AddUserPage = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isEditMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        loadUsers();
        loadRoles();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await api.get('/api/users');
            setUsers(response.data);
        } catch (err) {
            message.error('Ошибка загрузки пользователей');
        }
    };

    const loadRoles = async () => {
        try {
            const response = await api.get('/api/role');
            setRoles(response.data);
        } catch (err) {
            message.error('Ошибка при загрузке ролей');
        }
    };

    const handleAddUser = async (values) => {
        try {
            await api.post('/api/users', values);
            message.success('Пользователь успешно добавлен');
            setModalVisible(false);
            loadUsers();
        } catch (err) {
            message.error(err.response?.data.message || 'Произошла ошибка');
        }
    };

    const handleEditUser = async (values) => {
        if (!selectedUser?.id) {
            message.error(
                'Не удалось идентифицировать выбранного пользователя'
            );
            return;
        }
        try {
            await api.put(`/api/users/${selectedUser.id}`, values);
            message.success('Пользователь успешно обновлен');
            setModalVisible(false);
            loadUsers();
            setSelectedUser(null);
        } catch (err) {
            message.error(err.response?.data.message || 'Произошла ошибка');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await api.delete(`/api/users/${userId}`);
            message.success('Пользователь успешно удален');
            loadUsers();
        } catch (err) {
            message.error(err.response?.data.message || 'Ошибка при удалении');
        }
    };

    const openAddUserModal = () => {
        setEditMode(false);
        form.resetFields();
        setModalVisible(true);
    };

    const openEditUserModal = (user) => {
        setEditMode(true);
        setSelectedUser(user);
        form.setFieldsValue({
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            email: user.email,
            roleId: user.roleId,
        });
        setModalVisible(true);
    };

    const columns = [
        {
            title: '№',
            dataIndex: 'index',
            render: (_, __, index) => index + 1,
        },
        {
            title: 'Имя',
            dataIndex: 'firstName',
        },
        {
            title: 'Фамилия',
            dataIndex: 'lastName',
        },
        {
            title: 'Номер Телефона',
            dataIndex: 'phoneNumber',
        },
        {
            title: 'Email',
            dataIndex: 'email',
        },
        {
            title: 'Роль',
            dataIndex: ['Role', 'name'],
        },
        {
            title: 'Действия',
            dataIndex: 'actions',
            render: (_, user) => (
                <>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => openEditUserModal(user)}
                    />
                    <Popconfirm
                        title="Вы уверены, что хотите удалить этого пользователя?"
                        onConfirm={() => handleDeleteUser(user.id)}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button type="link" icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </>
            ),
        },
    ];

    return (
        <div>
            <Layout className="layout">
            <h1>Управление пользователями</h1>
            <Button
                className="global-button"
                type="primary"
                icon={<PlusOutlined />}
                onClick={openAddUserModal}
            >
                Создать пользователя
            </Button>
            <CustomTable dataSource={users} columns={columns} rowKey="id" />

            <Modal
                title={
                    isEditMode
                        ? 'Редактировать пользователя'
                        : 'Добавить пользователя'
                }
                visible={isModalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={isEditMode ? handleEditUser : handleAddUser}
                    layout="vertical"
                >
                    <Form.Item
                        label="Имя"
                        name="firstName"
                        rules={[{ required: true, message: 'Введите имя' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Фамилия"
                        name="lastName"
                        rules={[{ required: true, message: 'Введите фамилию' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Номер телефона"
                        name="phoneNumber"
                        rules={[
                            {
                                required: true,
                                message: 'Введите номер телефона',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            {
                                required: true,
                                type: 'email',
                                message: 'Введите корректный Email',
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Пароль"
                        name="password"
                        rules={
                            !isEditMode
                                ? [
                                      {
                                          required: true,
                                          message: 'Введите пароль',
                                      },
                                  ]
                                : []
                        }
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item
                        label="Роль"
                        name="roleId"
                        rules={[{ required: true, message: 'Выберите роль' }]}
                    >
                        <Select placeholder="Выберите роль">
                            {roles.map((role) => (
                                <Option key={role.id} value={role.id}>
                                    {role.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {isEditMode ? 'Сохранить изменения' : 'Добавить'}
                        </Button>
                        <Button
                            style={{ marginLeft: 10 }}
                            onClick={() => setModalVisible(false)}
                        >
                            Отмена
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            </Layout>
        </div>
    );
};

export default AddUserPage;
