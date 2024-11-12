import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/api';
import { AuthContext } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import AthleteRegistrationModal from '../modal/AthleteRegistrationModal';
import ExerciseDetailsModal from '../modal/ExerciseDetailsModal';
import { Button, Col, Container } from 'react-bootstrap';
import './RegisterAthletePageCoach.css';

const RegisterAthletePageCoach = () => {
	const { t } = useTranslation();
	const [competitions, setCompetitions] = useState([]);
	const [athletes, setAthletes] = useState([]);
	const [athleteAge, setAthleteAge] = useState([]);
	const [athleteTrend, setAthleteTrend] = useState([]);
	const [participations, setParticipations] = useState([]);
	const [levels, setLevels] = useState([]);
	const [disciplines, setDisciplines] = useState([]);
	const [levelId, setLevelId] = useState('');
	const [disciplineId, setDisciplineId] = useState('');
	const [error, setError] = useState('');
	const [allExercises, setAllExercises] = useState([]);
	const [detailExercises, setDetailExercises] = useState([]);
	const [filteredExercises, setFilteredExercises] = useState([]);
	const [selectedParticipationDetails, setSelectedParticipationDetails] =
		useState(null);
	const [isRegistrationModalVisible, setIsRegistrationModalVisible] =
		useState(false);
	const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
	const [editingParticipation, setEditingParticipation] = useState(null);
	const [coaches, setCoaches] = useState([]);
	const [initialValues, setInitialValues] = useState({
		athleteId: '',
		competitionId: '',
		athleteAgeId: '',
		athleteTrendId: '',
		levelId: '',
		selectedExercises: [],
		disciplineId: '',
	});

	const [payCompetitions, setPayCompetitions] = useState({});

	const { user } = useContext(AuthContext);
	const coachId = user.userId;

	useEffect(() => {
		loadInitialData();
		loadCoaches();
	}, []);

	useEffect(() => {
		loadParticipations();
	}, [participations.length]);

	useEffect(() => {
		const loadExercises = async () => {
			try {
				const response = await api.get('/api/exercise');
				const options = response.data.map((ex) => ({
					value: ex.id,
					label: `${ex.code} - ${ex.name}`,
					level: ex.levelId,
					discipline: ex.disciplineId,
				}));
				setAllExercises(options);
				setFilteredExercises(options);
			} catch (error) {
				console.error('Error loading exercises:', error);
			}
		};
		loadExercises();
	}, []);

	useEffect(() => {
		const filtered = allExercises.filter(
			(ex) =>
				(levelId === '' || ex.level === parseInt(levelId)) &&
				(disciplineId === '' ||
					ex.discipline === parseInt(disciplineId))
		);
		setFilteredExercises(filtered);
	}, [levelId, disciplineId, allExercises]);

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
			const oneCoach = [user];
			setCoaches(oneCoach);
		} catch (err) {
			console.error('Error loading trainers:', err);
			setError('Failed to load trainers.');
		}
	};

	const handleRegister = async (postData) => {
		try {
			let response;
			if (editingParticipation) {
				response = await api.put(
					`/api/comp-part/${editingParticipation.id}`,
					postData
				);
				setParticipations((prev) =>
					prev.map((p) =>
						p.id === editingParticipation.id
							? { ...p, ...response.data }
							: p
					)
				);
			} else {
				const response = await api.post('/api/comp-part', postData);
				console.log('Athlete registration completed successfully!');
				setParticipations((prevParticipations) => [
					...prevParticipations,
					response.data,
				]);
			}

			setParticipations([...participations, response.data]);
			closeModal();
			// window.location.reload();
		} catch (err) {
			console.error('Error during registration:', err);
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
		setEditingParticipation(participation); // Устанавливаем участие для редактирования

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
		});
		setEditingParticipation(null);
	};

	const sortParticipations = (participations) => {
		return participations.sort((a, b) => {
			const lastNameA = a.Athlete?.lastName.toLowerCase() || '';
			const lastNameB = b.Athlete?.lastName.toLowerCase() || '';
			if (lastNameA < lastNameB) return -1;
			if (lastNameA > lastNameB) return 1;
			return 0;
		});
	};

	const sortedParticipations = sortParticipations(participations);

	return (
		<Container>
			<Col>
				<h1 className='my-4'>{t('h1.athleteRegistration')}</h1>
			</Col>
			<Col className='text-center'>
				<Button
					variant='success'
					onClick={() => setIsRegistrationModalVisible(true)}>
					{t('button.registrationNoun')}
				</Button>
			</Col>

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

			{isDetailsModalVisible && selectedParticipationDetails && (
				<ExerciseDetailsModal
					isVisible={isDetailsModalVisible}
					onClose={() => setIsDetailsModalVisible(false)}
					selectedParticipationDetails={selectedParticipationDetails}
					t={t}
				/>
			)}

			<div className='table-container'>
				<table>
					<thead>
						<tr>
							<th>№</th>
							<th>{t('table.athlete')}</th>
							<th>{t('table.competition')}</th>
							<th>{t('table.direction')}</th>
							<th>{t('table.age')}</th>
							<th>{t('table.actions')}</th>
						</tr>
					</thead>
					<tbody>
						{sortedParticipations.map((participation, index) => (
							<tr
								className={
									payCompetitions[participation.id]
										? 'paid-row'
										: ''
								}
								key={participation.id}>
								<td>{index + 1}</td>
								<td>
									{participation.Athlete?.lastName}{' '}
									{participation.Athlete?.firstName}
								</td>
								<td>{participation.Competition?.title}</td>
								<td>{participation.AthleteTrend?.trends}</td>
								<td>{participation.AthleteAge?.age}</td>
								<td>
									<Button
										className='m-1'
										variant='info'
										onClick={() => {
											handleDetailsClick(
												participation.id
											);
										}}>
										<i className='bi bi-file-earmark-text'></i>{' '}
									</Button>
									<Button
										className='m-1'
										variant='warning'
										onClick={() =>
											openEditModal(participation)
										}>
										<i className='bi bi-pencil'></i>{' '}
										{/* Иконка редактирования */}
									</Button>
									<Button
										className='m-1'
										variant='danger'
										onClick={() =>
											handleDeleteAthleteRegistration(
												participation.id
											)
										}>
										<i className='bi bi-trash'></i>{' '}
										{/* Иконка удаления */}
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Container>
	);
};

export default RegisterAthletePageCoach;
