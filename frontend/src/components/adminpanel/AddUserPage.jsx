import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import './AddUserPage.css';
import Modal from '../Modal';
import { Container } from 'react-bootstrap';

const AddUserPage = () => {
	const [users, setUsers] = useState([]);
	const [roles, setRoles] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [roleId, setRole] = useState('');
	const [error, setError] = useState('');
	const [isAddUserModalVisible, setAddUserModalVisible] = useState(false);
	const [isEditUserModalVisible, setEditUserModalVisible] = useState(false);

	useEffect(() => {
		loadUsers();
		loadRoles();
	}, []);

	const loadUsers = async () => {
		try {
			const response = await api.get('/api/users');
			setUsers(response.data);
		} catch (err) {
			console.error('Ошибка загрузки пользователей:', err);
		}
	};
	const loadRoles = async () => {
		try {
			const response = await api.get('/api/role'); // Убедитесь, что этот URL верный
			setRoles(response.data);
		} catch (err) {
			console.error('Ошибка при загрузке ролей:', err);
		}
	};

	const handleAddUser = async (e) => {
		e.preventDefault();
		try {
			await api.post('/api/users', {
				firstName,
				lastName,
				phoneNumber,
				email,
				password,
				roleId,
			});
			console.log('Пользователь успешно добавлен!');
			loadUsers();
			setFirstName('');
			setLastName('');
			setPhoneNumber('');
			setEmail('');
			setPassword('');
			setRole('');
			setAddUserModalVisible(false);
		} catch (err) {
			setError(err.response?.data.message || 'Произошла ошибка');
		}
	};

	const handleSelectUser = (user) => {
		setSelectedUser(user);
		setFirstName(user.firstName);
		setLastName(user.lastName);
		setPhoneNumber(user.phoneNumber);
		setEmail(user.email);
		setRole(user.roleId);
		setEditUserModalVisible(true);
	};

	const closeModals = () => {
		setAddUserModalVisible(false);
		setEditUserModalVisible(false);
	};
	const handleUpdateUser = async (e) => {
		e.preventDefault();
		if (!selectedUser || !selectedUser.id) {
			// Предполагая, что у объекта пользователя есть свойство id
			setError('Не удалось идентифицировать выбранного пользователя.');
			return;
		}
		try {
			const updateData = {
				firstName,
				lastName,
				phoneNumber,
				email,
				roleId,
				// Добавьте пароль в данные для обновления, если он был изменён
				...(password && { password }),
			};
			await api.put(`/api/users/${selectedUser.id}`, updateData);
			console.log('Данные пользователя успешно обновлены!');
			loadUsers();
			setEditUserModalVisible(false); // Закрываем модальное окно после обновления
			setFirstName('');
			setLastName('');
			setPhoneNumber('');
			setEmail('');
			setRole('');
			setSelectedUser(null);
		} catch (err) {
			setError(err.response?.data.message || 'Произошла ошибка');
		}
	};

	const handleDeleteUser = async (userId) => {
		if (
			window.confirm('Вы уверены, что хотите удалить этого пользователя?')
		) {
			try {
				await api.delete(`/api/users/${userId}`);
				console.log('Пользователь успешно удален!');
				loadUsers(); // Обновляем список пользователей
			} catch (err) {
				console.error('Ошибка при удалении пользователя:', err);
				setError(
					err.response?.data.message ||
						'Произошла ошибка при удалении'
				);
			}
		}
	};

	return (
		<Container>
			<h1>Управление пользователями</h1>
			<button
				className='edit-button'
				onClick={() => setAddUserModalVisible(true)}>
				Создать пользователя
			</button>

			{isAddUserModalVisible && (
				<Modal onClose={closeModals}>
					<form
						onSubmit={handleAddUser}
						className='user-form'>
						<h3>Добавить пользователя</h3>
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
						<label htmlFor='phoneNumber'>
							Номер Телефону:
							<input
								type='text'
								id='phoneNumber'
								value={phoneNumber}
								onChange={(e) => setPhoneNumber(e.target.value)}
								required
							/>
						</label>
						<label htmlFor='email'>
							Email:
							<input
								type='email'
								id='email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</label>
						<label htmlFor='password'>
							Пароль:
							<input
								type='password'
								id='password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</label>
						<label htmlFor='role'>Роль:</label>
						<select
							id='role'
							value={roleId}
							onChange={(e) => setRole(e.target.value)}
							required>
							{roles.map((role) => (
								<option
									key={role.id}
									value={role.id}>
									{role.name}
								</option>
							))}
						</select>
						<div className='form-actions'>
							<button type='submit'>Добавить</button>
							<button
								type='button'
								onClick={closeModals}>
								Отмена
							</button>
						</div>
						{error && <p className='error-message'>{error}</p>}
					</form>
				</Modal>
			)}

			{isEditUserModalVisible && (
				<Modal onClose={() => setEditUserModalVisible(false)}>
					<form
						onSubmit={handleUpdateUser}
						className='user-form'>
						<h3>Редактировать пользователя</h3>
						<label htmlFor='edit-firstName'>Имя:</label>
						<input
							type='text'
							id='edit-firstName'
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							required
						/>
						<label htmlFor='edit-lastName'>Фамилия:</label>
						<input
							type='text'
							id='edit-lastName'
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							required
						/>
						<label htmlFor='edit-phoneNumber'>
							Номер телефону:
						</label>
						<input
							type='text'
							id='edit-phoneNumber'
							value={phoneNumber}
							onChange={(e) => setPhoneNumber(e.target.value)}
							required
						/>
						<label htmlFor='edit-email'>Email:</label>
						<input
							type='email'
							id='edit-email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>

						<label htmlFor='edit-password'>Пароль:</label>
						<input
							type='password'
							id='edit-password'
							value={password} // Убедитесь, что у вас определено состояние password
							onChange={(e) => setPassword(e.target.value)}
							// Не устанавливайте атрибут required, если хотите разрешить пользователям не изменять пароль
						/>

						<label htmlFor='edit-role'>Роль:</label>
						<select
							id='edit-role'
							value={roleId}
							onChange={(e) => setRole(e.target.value)}
							required>
							{roles.map((role) => (
								<option
									key={role.id}
									value={role.id}>
									{role.name}
								</option>
							))}
						</select>
						<div className='form-actions'>
							<button type='submit'>Сохранить изменения</button>
							<button
								type='button'
								onClick={() => setEditUserModalVisible(false)}>
								Отмена
							</button>
						</div>
						{error && <p className='error-message'>{error}</p>}
					</form>
				</Modal>
			)}

			<div className='table-container'>
				<h2>Список пользователей</h2>
				<table>
					<thead>
						<tr>
							<th>№</th>
							<th>Имя</th>
							<th>Фамилия</th>
							<th>Номер Телефону</th>
							<th>Email</th>
							<th>Роль</th>
							<th>Действия</th>
						</tr>
					</thead>
					<tbody>
						{users.map((user, index) => (
							<tr
								key={user.id}
								className={
									selectedUser === user ? 'selected' : ''
								}>
								<td>{index + 1}</td>
								<td>{user.firstName}</td>
								<td>{user.lastName}</td>
								<td>{user.phoneNumber}</td>
								<td>{user.email}</td>
								<td>{user.Role.name}</td>
								<td>
									<button
										className='edit-button'
										onClick={(e) => {
											e.stopPropagation(); // Предотвращаем всплытие события
											handleSelectUser(user);
										}}>
										Редактировать
									</button>

									<button
										className='delete-button'
										onClick={() =>
											handleDeleteUser(user.id)
										}>
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

export default AddUserPage;
