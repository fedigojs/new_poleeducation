import React, { useState, useEffect, useMemo } from 'react';
import { Button, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import CustomTable from '../Table/customTable';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import api from '../../api/api';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

const AddAthletePage = () => {
	const { t } = useTranslation();
	const [athletes, setAthletes] = useState([]);
	const [coaches, setCoaches] = useState([]);
	const [isModalVisible, setModalVisible] = useState(false);
	const [isEditMode, setEditMode] = useState(false);
	const [selectedAthlete, setSelectedAthlete] = useState(null);
	const [form] = Form.useForm();
	const [sortDirection, setSortDirection] = useState('asc'); // 'asc' для возрастания, 'desc' для убывания

	useEffect(() => {
		loadAthletes();
		loadRoles();
	}, []);

	const loadAthletes = async () => {
		try {
			const response = await api.get('/api/athletes');
			setAthletes(response.data);
		} catch (err) {
			message.error('Ошибка загрузки атлетов');
		}
	};

	const loadRoles = async () => {
		try {
			const responseCoaches = await api.get('/api/users');
			setCoaches(responseCoaches.data);
		} catch (err) {
			message.error('Ошибка при загрузке тренеров');
		}
	};

	const handleAddAthlete = async (values) => {
		try {
			await api.post('/api/athletes', values);
			message.success('Атлет успешно добавлен');
			setModalVisible(false);
			loadAthletes();
		} catch (err) {
			message.error(
				err.response?.data.message || 'Ошибка при добавлении'
			);
		}
	};

	const handleEditAthlete = async (values) => {
		if (!selectedAthlete) {
			message.error('Выберите атлета для изменения');
			return;
		}
		try {
			await api.put(`/api/athletes/${selectedAthlete.id}`, values);
			message.success('Данные атлета успешно обновлены');
			setModalVisible(false);
			loadAthletes();
			setSelectedAthlete(null);
		} catch (err) {
			message.error(err.response?.data.message || 'Ошибка при изменении');
		}
	};

	const handleDeleteAthlete = async (athleteId) => {
		try {
			await api.delete(`/api/athletes/${athleteId}`);
			message.success('Атлет успешно удален');
			loadAthletes();
		} catch (err) {
			message.error(err.response?.data.message || 'Ошибка при удалении');
		}
	};

	const openAddAthleteModal = () => {
		setEditMode(false);
		form.resetFields();
		setModalVisible(true);
	};

	const openEditAthleteModal = (athlete) => {
		setEditMode(true);
		setSelectedAthlete(athlete);
		form.setFieldsValue({
			firstName: athlete.firstName,
			lastName: athlete.lastName,
			coachId: athlete.coachId,
		});
		setModalVisible(true);
	};

	const sortedAthletes = useMemo(() => {
		return athletes.sort((a, b) => {
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
		setSortDirection((prevSortDirection) =>
			prevSortDirection === 'asc' ? 'desc' : 'asc'
		);
	};

	const columns = [
		{
			title: '№',
			dataIndex: 'index',
			render: (_, __, index) => index + 1,
		},
		{
			title: 'Фамилия Имя',
			dataIndex: 'name',
			render: (_, athlete) => `${athlete.lastName} ${athlete.firstName}`,
			sorter: handleSortByName,
		},
		{
			title: 'Тренер',
			dataIndex: 'coachName',
			render: (_, athlete) => {
				const coach = coaches.find((c) => c.id === athlete.coachId);
				return `${coach?.firstName || ''} ${coach?.lastName || ''}`;
			},
		},
		{
			title: 'Действия',
			dataIndex: 'actions',
			render: (_, athlete) => (
				<>
					<Button
						type='link'
						icon={<EditOutlined />}
						onClick={() => openEditAthleteModal(athlete)}
					/>
					<Popconfirm
						title='Вы уверены, что хотите удалить этого атлета?'
						onConfirm={() => handleDeleteAthlete(athlete.id)}
						okText='Да'
						cancelText='Нет'>
						<Button
							type='link'
							icon={<DeleteOutlined />}
							danger
						/>
					</Popconfirm>
				</>
			),
		},
	];

	return (
		<div>
			<h1>Управление атлетами</h1>
			<Button
				type='primary'
				icon={<PlusOutlined />}
				onClick={openAddAthleteModal}
				style={{ marginBottom: 20 }}>
				Создать атлета
			</Button>
			<CustomTable
				dataSource={sortedAthletes}
				columns={columns}
				rowKey='id'
			/>
			<Modal
				title={isEditMode ? 'Редактировать атлета' : 'Добавить атлета'}
				visible={isModalVisible}
				onCancel={() => setModalVisible(false)}
				footer={null}>
				<Form
					form={form}
					onFinish={isEditMode ? handleEditAthlete : handleAddAthlete}
					layout='vertical'>
					<Form.Item
						label='Имя'
						name='firstName'
						rules={[{ required: true, message: 'Введите имя' }]}>
						<Input />
					</Form.Item>
					<Form.Item
						label='Фамилия'
						name='lastName'
						rules={[
							{ required: true, message: 'Введите фамилию' },
						]}>
						<Input />
					</Form.Item>
					<Form.Item
						label='Тренер'
						name='coachId'
						rules={[
							{ required: true, message: 'Выберите тренера' },
						]}>
						<Select placeholder='Выберите тренера'>
							{coaches.map((coach) => (
								<Option
									key={coach.id}
									value={coach.id}>
									{coach.firstName} {coach.lastName}
								</Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item>
						<Button
							type='primary'
							htmlType='submit'>
							{isEditMode ? 'Сохранить изменения' : 'Добавить'}
						</Button>
						<Button
							style={{ marginLeft: 10 }}
							onClick={() => setModalVisible(false)}>
							Отмена
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default AddAthletePage;
