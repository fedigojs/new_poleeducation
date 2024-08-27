// src/components/AddAthleteModal.js
import React, { useState } from 'react';
import Modal from '../Modal';

const AddAthleteModal = ({
	isVisible,
	onClose,
	onSubmit,
	coaches,
	coachRoleId,
}) => {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [coachId, setCoachId] = useState('');
	const [error, setError] = useState('');

	const handleAddAthlete = async (e) => {
		e.preventDefault();
		try {
			await onSubmit({ firstName, lastName, coachId });
			setFirstName('');
			setLastName('');
			setCoachId('');
			onClose();
		} catch (err) {
			setError(err.response?.data.message || 'Произошла ошибка');
		}
	};

	return (
		<Modal
			onClose={onClose}
			isVisible={isVisible}>
			<form
				onSubmit={handleAddAthlete}
				className='athlete-form'>
				<h3>Добавить атлета</h3>
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
							.filter((coach) => coach.roleId === coachRoleId)
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
					<button type='submit'>Добавить</button>
					<button
						type='button'
						onClick={onClose}>
						Отмена
					</button>
				</div>
				{error && <p className='error-message'>{error}</p>}
			</form>
		</Modal>
	);
};

export default AddAthleteModal;
