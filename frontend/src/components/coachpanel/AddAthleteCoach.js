import React, { useState, useEffect, useMemo, useContext } from 'react';
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
import AddAthleteCoachModal from '../modal/AddAthleteCoachModal';
import { AuthContext } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const AddAthleteCoach = () => {
	const { t } = useTranslation();
	const [athletes, setAthletes] = useState([]);
	const [coaches, setCoaches] = useState([]);
	const [selectedAthlete, setSelectedAthlete] = useState(null);
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [error, setError] = useState('');
	const [isAddAthleteModalVisible, setAddAthleteModalVisible] =
		useState(false);
	const [isEditAthleteModalVisible, setEditAthleteModalVisible] =
		useState(false);
	const [sortDirection, setSortDirection] = useState('asc'); // Сортировка по имени

	const { user } = useContext(AuthContext);
	const coachRoleId = 2;

	useEffect(() => {
		loadCoaches();
		loadAthletes();
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

	const handleAddAthleteSubmit = async ({ firstName, lastName }) => {
		try {
			const coachId = Number(user.userId);

			await api.post('/api/athletes', {
				firstName,
				lastName,
				coachId,
			});
			console.log('Athlete added successfully!');
			loadAthletes();
			closeModals();
		} catch (err) {
			setError('An error occurred while adding an athlete.');
		}
	};

	const handleUpdateAthlete = async (e) => {
		e.preventDefault();
		if (!selectedAthlete) {
			setError('Select an athlete to change.');
			return;
		}
		try {
			await api.put(`/api/athletes/${selectedAthlete.id}`, {
				firstName,
				lastName,
				coachId: user.id,
			});
			console.log('Athlete data has been successfully updated!');
			loadAthletes();
			closeModals();
		} catch (err) {
			setError('An error occurred while updating athlete data.');
		}
	};

	const handleSelectAthlete = (athlete) => {
		setSelectedAthlete(athlete);
		setFirstName(athlete.firstName);
		setLastName(athlete.lastName);
		setEditAthleteModalVisible(true);
	};

	const closeModals = () => {
		setAddAthleteModalVisible(false);
		setEditAthleteModalVisible(false);
		setSelectedAthlete(null);
		setFirstName('');
		setLastName('');
	};

	const handleDeleteAthlete = async (athleteId) => {
		if (window.confirm('Are you sure you want to remove this athlete?')) {
			try {
				await api.delete(`/api/athletes/${athleteId}`);
				console.log('The athlete has been successfully removed!');
				loadAthletes();
			} catch (err) {
				console.error('Error when deleting an athlete:', err);
				setError('An error occurred when deleting an athlete.');
			}
		}
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

	return (
		<>
			<Container>
				<Row className='my-4'>
					<Col>
						<h1 className='text-center'>
							{t('h1.athleteManagement')}
						</h1>
					</Col>
				</Row>

				<Row className='my-3'>
					<Col className='text-center'>
						<Button
							variant='success'
							onClick={() => setAddAthleteModalVisible(true)}>
							{t('button.addParticipant')}
						</Button>
					</Col>
				</Row>

				<Row className='my-3'>
					<Col>
						<Table
							striped
							bordered
							hover
							responsive>
							<thead>
								<tr>
									<th className='text-center'>№</th>
									<th
										onClick={handleSortByName}
										style={{ cursor: 'pointer' }}>
										{t('table.pib')}
									</th>
									<th className='w-25'>
										{t('table.actions')}
									</th>
								</tr>
							</thead>
							<tbody>
								{sortedAthletes.map((athlete, index) => (
									<tr key={athlete.id}>
										<td className='text-center align-middle'>
											{index + 1}
										</td>
										<td className='align-middle'>
											{athlete.lastName}{' '}
											{athlete.firstName}
										</td>
										<td className='text-center align-middle'>
											<Button
												variant='warning'
												className='m-1'
												onClick={() =>
													handleSelectAthlete(athlete)
												}>
												<i className='bi bi-pencil'></i>{' '}
												{/* Иконка редактирования */}
											</Button>
											<Button
												variant='danger'
												onClick={() =>
													handleDeleteAthlete(
														athlete.id
													)
												}>
												<i className='bi bi-trash'></i>{' '}
												{/* Иконка удаления */}
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					</Col>
				</Row>

				{isAddAthleteModalVisible && (
					<AddAthleteCoachModal
						isVisible={isAddAthleteModalVisible}
						onClose={closeModals}
						onSubmit={handleAddAthleteSubmit}
						coaches={user}
						coachRoleId={coachRoleId}
					/>
				)}

				<Modal
					show={isEditAthleteModalVisible}
					onHide={closeModals}
					centered>
					<Modal.Header closeButton>
						<Modal.Title>
							{t('modal.title.editAthlete')}
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<Form onSubmit={handleUpdateAthlete}>
							<Form.Group controlId='firstName'>
								<Form.Label>{t('label.firstName')}</Form.Label>
								<Form.Control
									type='text'
									value={firstName}
									onChange={(e) =>
										setFirstName(e.target.value)
									}
									required
								/>
							</Form.Group>

							<Form.Group controlId='lastName'>
								<Form.Label>{t('label.lastName')}</Form.Label>
								<Form.Control
									type='text'
									value={lastName}
									onChange={(e) =>
										setLastName(e.target.value)
									}
									required
								/>
							</Form.Group>

							<Button
								variant='primary'
								type='submit'
								className='m-2'>
								{t('button.edit')}
							</Button>
						</Form>
					</Modal.Body>
				</Modal>
			</Container>

			{error && <p className='error-message'>{error}</p>}
		</>
	);
};

export default AddAthleteCoach;
