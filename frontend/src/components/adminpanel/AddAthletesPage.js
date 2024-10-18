import React, { useState, useEffect, useMemo } from 'react';
import {
	Button,
	Table,
	Form,
	Modal,
	Container,
	Row,
	Col,
} from 'react-bootstrap';
import api from '../../api/api';
import '../Modal.css';
// import Modal from '../Modal';
import AddAthleteModal from '../modal/AddAthleteModal';

const AddAthletePage = () => {
	const [athletes, setAthletes] = useState([]);

	const [coaches, setCoaches] = useState([]);

	const [selectedAthlete, setSelectedAthlete] = useState(null);
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');

	const [coachId, setCoachId] = useState('');
	const [error, setError] = useState('');
	const [isAddAthleteModalVisible, setAddAthleteModalVisible] =
		useState(false);
	const [isEditAthleteModalVisible, setEditAthleteModalVisible] =
		useState(false);

	const coachRoleId = 2;

	useEffect(() => {
		loadAthletes();
		loadRoles();
	}, []);

	const loadAthletes = async () => {
		const token = localStorage.getItem('authToken');

		try {
			const response = await api.get('/api/athletes', token);
			setAthletes(response.data);
		} catch (err) {
			console.error('Ошибка загрузки атлетов:', err);
			setError('Не удалось загрузить атлетов.');
		}
	};

	const loadRoles = async () => {
		try {
			const responseCoaches = await api.get('/api/users');
			setCoaches(responseCoaches.data);
		} catch (err) {
			console.error('Ошибка при загрузке ролей:', err);
			setError('Не удалось загрузить роли.');
		}
	};

	const handleAddAthleteSubmit = async ({ firstName, lastName, coachId }) => {
		try {
			await api.post('/api/athletes', {
				firstName,
				lastName,
				coachId,
			});
			console.log('Атлет успешно добавлен!');
			loadAthletes();
		} catch (err) {
			throw err;
		}
	};

	const handleUpdateAthlete = async (e) => {
		e.preventDefault();
		if (!selectedAthlete) {
			setError('Выберите атлета для изменения.');
			return;
		}
		try {
			await api.put(`/api/athletes/${selectedAthlete.id}`, {
				firstName,
				lastName,
				coachId,
			});
			console.log('Данные атлета успешно обновлены!');
			loadAthletes();
			setFirstName('');
			setLastName('');
			setCoachId('');
			setSelectedAthlete(null);
		} catch (err) {
			setError(err.response?.data.message || 'Произошла ошибка');
		}
	};

	const handleSelectAthlete = (athlete) => {
		setSelectedAthlete(athlete);
		setFirstName(athlete.firstName);
		setLastName(athlete.lastName);
		setCoachId(athlete.coachId);
		setEditAthleteModalVisible(true); // Показываем модальное окно для редактирования
	};

	const closeModals = () => {
		setAddAthleteModalVisible(false);
		setEditAthleteModalVisible(false);
	};

	const handleDeleteAthlete = async (athleteId) => {
		if (window.confirm('Вы уверены, что хотите удалить этого атлета?')) {
			try {
				await api.delete(`/api/athletes/${athleteId}`);
				console.log('Атлет успешно удален!');
				loadAthletes(); // Обновляем список атлетов
			} catch (err) {
				console.error('Ошибка при удалении атлета:', err);
				setError(
					err.response?.data.message ||
						'Произошла ошибка при удалении'
				);
			}
		}
	};

	const [sortDirection, setSortDirection] = useState('asc'); // 'asc' для возрастания, 'desc' для убывания

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

	return (
		<Container>
			<h1>Управление атлетами</h1>
			<button
				className='edit-button'
				onClick={() => setAddAthleteModalVisible(true)}>
				Создать атлета
			</button>
			{isAddAthleteModalVisible && (
				<AddAthleteModal
					isVisible={isAddAthleteModalVisible}
					onClose={closeModals}
					onSubmit={handleAddAthleteSubmit}
					coaches={coaches}
					coachRoleId={coachRoleId}
				/>
			)}
			{isEditAthleteModalVisible && (
				<Modal onClose={closeModals}>
					<form onSubmit={(e) => handleUpdateAthlete(e)}>
						<h3>Редактировать атлета</h3>
						<label htmlFor='firstName'>
							Имя:
							<input
								type='text'
								id='firstName'
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								required
							/>
						</label>
						<label htmlFor='lastName'>
							Фамилия:
							<input
								type='text'
								id='lastName'
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								required
							/>
						</label>
						<label htmlFor='coachId'>
							Тренер:
							<select
								id='coachId'
								value={coachId}
								onChange={(e) => setCoachId(e.target.value)}
								required>
								<option value=''>Выберите тренера</option>
								{coaches
									.filter(
										(coach) => coach.roleId === coachRoleId
									)
									.map((coach) => (
										<option
											key={coach.id}
											value={coach.id}>
											{coach.firstName} {coach.lastName}
										</option>
									))}
							</select>
						</label>
						<div className='form-actions'>
							<button type='submit'>Сохранить изменения</button>
							<button
								type='button'
								onClick={closeModals}>
								Отмена
							</button>
						</div>
					</form>
				</Modal>
			)}

			<div className='table-container'>
				<h2>Список атлетов</h2>
				<table>
					<thead>
						<tr>
							<th>ID</th>
							<th onClick={handleSortByName}>Фамилия Имя</th>
							<th>Тренер</th>
							<th>Действия</th>
						</tr>
					</thead>
					<tbody>
						{sortedAthletes.map((athlete, index) => {
							const coach = coaches.find(
								(cch) => cch.id === athlete.coachId
							);
							const coachName = `${coach?.firstName} ${coach?.lastName}`;

							return (
								<tr key={athlete.id}>
									<td>{index + 1}</td>
									<td>
										{athlete.lastName} {athlete.firstName}
									</td>

									<td>{coachName}</td>
									<td>
										<button
											className='edit-button'
											onClick={() =>
												handleSelectAthlete(athlete)
											}>
											Редактировать
										</button>
										<button
											className='delete-button'
											onClick={() =>
												handleDeleteAthlete(athlete.id)
											}>
											Удалить
										</button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</Container>
	);
};

export default AddAthletePage;
