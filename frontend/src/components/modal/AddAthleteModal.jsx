// src/components/AddAthleteModal.js
import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';

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
			show={isVisible}
			onHide={onClose}>
			<Modal.Header closeButton>
				<Modal.Title>Добавить атлета</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form onSubmit={handleAddAthlete}>
					<Form.Group controlId='firstName'>
						<Form.Label>Имя</Form.Label>
						<Form.Control
							type='text'
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							required
						/>
					</Form.Group>

					<Form.Group controlId='lastName'>
						<Form.Label>Фамилия</Form.Label>
						<Form.Control
							type='text'
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							required
						/>
					</Form.Group>

					<Form.Group controlId='coachId'>
						<Form.Label>Тренер</Form.Label>
						<Form.Control
							as='select'
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
						</Form.Control>
					</Form.Group>

					<div className='form-actions'>
						<Button
							className='m-3'
							variant='primary'
							type='submit'>
							Добавить
						</Button>
						<Button
							className='m-3'
							variant='secondary'
							onClick={onClose}
							type='button'>
							Отмена
						</Button>
					</div>

					{error && (
						<Alert
							variant='danger'
							className='mt-3'>
							{error}
						</Alert>
					)}
				</Form>
			</Modal.Body>
		</Modal>
	);
};
AddAthleteModal.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onSubmit: PropTypes.func.isRequired,
	coaches: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			firstName: PropTypes.string.isRequired,
			lastName: PropTypes.string.isRequired,
			roleId: PropTypes.string.isRequired,
		})
	).isRequired,
	coachRoleId: PropTypes.string.isRequired,
};

export default AddAthleteModal;
