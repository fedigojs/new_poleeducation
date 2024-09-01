import React, { useState, useEffect, useContext } from 'react';
import Select from 'react-select';
import api from '../../api/api';
import Modal from '../Modal';
import { AuthContext } from '../../context/AuthContext';
import AddAthleteCoachModal from '../modal/AddAthleteCoachModal';
import { useTranslation } from 'react-i18next';

const RegisterAthletePageCoach = () => {
	const { t } = useTranslation();
	const [competitions, setCompetitions] = useState([]);
	const [athletes, setAthletes] = useState([]);
	const [athleteAge, setAthleteAge] = useState([]);
	const [athleteTrend, setAthleteTrend] = useState([]);
	const [participations, setParticipations] = useState([]);
	const [levels, setLevels] = useState([]);
	const [disciplines, setDisciplines] = useState([]);
	const [athleteId, setAthleteId] = useState('');
	const [athleteAgeId, setAthleteAgeId] = useState('');
	const [athleteTrendId, setAthleteTrendId] = useState('');
	const [competitionId, setCompetitionId] = useState('');
	const [levelId, setLevelId] = useState('');
	const [selectedExercises, setSelectedExercises] = useState([]);
	const [disciplineId, setDisciplineId] = useState('');
	const [error, setError] = useState('');
	const [allExercises, setAllExercises] = useState([]);
	const [detailExercises, setDetailExercises] = useState([]);
	const [filteredExercises, setFilteredExercises] = useState([]);
	const [selectedParticipationDetails, setSelectedParticipationDetails] =
		useState(null);
	const [isRegistrationModalVisible, setIsRegistrationModalVisible] =
		useState(false);
	const [isAddAthleteModalVisible, setIsAthleteModalVisible] =
		useState(false);
	const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
	const [editingParticipation, setEditingParticipation] = useState(null);
	const [coaches, setCoaches] = useState([]); // Добавляем состояние для тренеров
	const { user } = useContext(AuthContext);
	const coachId = user.userId;

	useEffect(() => {
		loadInitialData();
		loadCoaches(); // Загружаем тренеров
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

	const handleRegister = async (e) => {
		e.preventDefault();

		const postData = {
			athleteId,
			competitionId,
			athleteAgeId,
			athleteTrendId,
			levelId,
			exerciseIds: selectedExercises.map((ex) => ex.value),
			disciplineId,
		};

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

			setIsRegistrationModalVisible(false);
			setParticipations([...participations, response.data]);
			closeModal();
		} catch (err) {
			console.error('Error during registration:', err);
			setError(
				err.response?.data.message ||
					'An error occurred during registration'
			);
		}
	};

	const handleExerciseChange = (selectedOptions) => {
		setSelectedExercises(selectedOptions || []);
	};

	const loadParticipations = async () => {
		try {
			const response = await api.get(
				`/api/comp-part/by-coach/${user.userId}`
			);
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

	const openModal = async (participationId = null) => {
		if (participationId) {
			try {
				const response = await api.get(
					`/api/comp-part/${participationId}`
				);
				const participation = response.data;
				console.log(participation);
				setAthleteId(participation.athleteId);
				setCompetitionId(participation.competitionId);
				setAthleteAgeId(participation.athleteAgeId);
				setAthleteTrendId(participation.athleteTrendId);
				setLevelId(participation.levelId);
				setDisciplineId(participation.disciplineId);
				setSelectedExercises(
					participation.exercises.map((ex) => ({
						value: ex.id,
						label: `${ex.name}`,
					}))
				);
				setEditingParticipation(participation);
			} catch (error) {
				console.error('Error loading member data:', error);
				setError('Failed to load member data.');
			}
		} else {
			resetForm();
		}
		setIsRegistrationModalVisible(true);
	};

	const closeModal = () => {
		setIsRegistrationModalVisible(false);
		resetForm();
	};

	const resetForm = () => {
		setAthleteId('');
		setCompetitionId('');
		setAthleteAgeId('');
		setAthleteTrendId('');
		setLevelId('');
		setSelectedExercises([]);
		setDisciplineId('');
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

	const handleAddAthleteSubmit = async ({ firstName, lastName, coachId }) => {
		try {
			await api.post('/api/athletes', {
				firstName,
				lastName,
				coachId,
			});
			console.log('Athlete added successfully!');

			setIsAthleteModalVisible(false);
			const response = await api.get(
				`/api/athletes/by-coach/${user.userId}`
			);
			setAthletes(response.data);
		} catch (error) {
			console.error('Error adding athlete:', error);
			setError('Failed to add athlete.');
		}
	};

	return (
		<div>
			<h1>{t('h1.athleteRegistration')}</h1>
			<button
				className='edit-button'
				onClick={() => setIsRegistrationModalVisible(true)}>
				{t('button.registrationNoun')}
			</button>

			{isRegistrationModalVisible && (
				<Modal
					onClose={() => setIsRegistrationModalVisible(false)}
					className='narrow-modal'>
					<form
						onSubmit={handleRegister}
						className='register-form'>
						<button
							className='modal-close-button'
							onClick={closeModal}>
							&times;
						</button>
						<h3>
							{editingParticipation
								? t('h3.editParticipant')
								: t('h3.registrationParticipant')}
						</h3>
						<button
							style={{
								position: 'absolute',
								top: '95px',
								right: '10px',
							}}
							onClick={() => setIsAthleteModalVisible(true)}>
							{t('button.addParticipant')}
						</button>
						<br />
						<label htmlFor='athlete'>
							{t('label.addParticipant')}:
						</label>
						<select
							style={{ width: '260px' }}
							id='athlete'
							value={athleteId}
							onChange={(e) => setAthleteId(e.target.value)}
							required>
							<option value=''>
								{t('option.selectParticipant')}
							</option>
							{athletes
								.sort((a, b) =>
									a.lastName.localeCompare(b.lastName)
								)
								.map((athlete) => (
									<option
										key={athlete.id}
										value={athlete.id}>
										{athlete.lastName} {athlete.firstName}
									</option>
								))}
						</select>

						<label htmlFor='competition'>
							{t('label.competition')}:
						</label>
						<select
							id='competition'
							value={competitionId}
							onChange={(e) => setCompetitionId(e.target.value)}
							required>
							<option value=''>
								{t('option.selectCompetition')}
							</option>
							{competitions.map((competition) => (
								<option
									key={competition.id}
									value={competition.id}>
									{competition.title}
								</option>
							))}
						</select>
						<label htmlFor='trends'>{t('label.direction')}:</label>
						<select
							id='trends'
							value={athleteTrendId}
							onChange={(e) => setAthleteTrendId(e.target.value)}
							required>
							<option value=''>
								{t('option.selectDirection')}
							</option>
							{athleteTrend.map((trends) => (
								<option
									key={trends.id}
									value={trends.id}>
									{trends.trends}
								</option>
							))}
						</select>
						<label htmlFor='ages'>{t('label.age')}:</label>
						<select
							id='ages'
							value={athleteAgeId}
							onChange={(e) => setAthleteAgeId(e.target.value)}
							required>
							<option value=''>{t('option.selectAge')}</option>
							{athleteAge.map((ages) => (
								<option
									key={ages.id}
									value={ages.id}>
									{ages.age}
								</option>
							))}
						</select>

						<label htmlFor='level'>{t('label.mastery')}:</label>
						<select
							id='level'
							value={levelId}
							onChange={(e) => setLevelId(e.target.value)}
							required>
							<option value=''>
								{t('option.selectMastery')}
							</option>
							{levels.map((level) => (
								<option
									key={level.id}
									value={level.id}>
									{level.name}
								</option>
							))}
						</select>

						<label htmlFor='discipline'>
							{t('label.discipline')}:
						</label>
						<select
							id='discipline'
							value={disciplineId}
							onChange={(e) => setDisciplineId(e.target.value)}
							required>
							<option value=''>
								{t('option.selectDiscipline')}
							</option>
							{disciplines.map((discipline) => (
								<option
									key={discipline.id}
									value={discipline.id}>
									{discipline.name}
								</option>
							))}
						</select>

						<label htmlFor='exercise'>{t('label.exercise')}:</label>
						<Select
							id='exercise'
							isMulti
							options={filteredExercises}
							value={selectedExercises}
							onChange={handleExerciseChange}
							className='basic-multi-select'
							classNamePrefix='select'
						/>

						<div className='form-actions'>
							<button type='submit'>
								{editingParticipation
									? t('button.edit')
									: t('button.registrationVerb')}
							</button>
							<button
								type='button'
								onClick={closeModal}>
								{t('button.cancel')}
							</button>
						</div>

						{error && <p className='error-message'>{error}</p>}
					</form>
				</Modal>
			)}

			{isAddAthleteModalVisible && (
				<AddAthleteCoachModal
					isVisible={isAddAthleteModalVisible}
					onClose={() => setIsAthleteModalVisible(false)}
					onSubmit={handleAddAthleteSubmit}
					coaches={coaches}
					coachRoleId={coachId}
				/>
			)}

			{isDetailsModalVisible && selectedParticipationDetails && (
				<Modal onClose={() => setIsDetailsModalVisible(false)}>
					<div className='modal-content'>
						<button
							className='modal-close-button'
							onClick={() => setIsDetailsModalVisible(false)}>
							&times;
						</button>
						<h3>{t('h3.exerciseDetails')}</h3>
						<h2>{t('table.athlete')}:</h2>
						<table className='details-table'>
							<thead>
								<tr>
									<th>{t('table.exercise')}</th>
									<th>{t('table.descriptions')}</th>
									<th>{t('table.image')}</th>
								</tr>
							</thead>
							<tbody>
								{selectedParticipationDetails.map(
									(detail, index) => (
										<tr key={index}>
											<td>{detail.exercise.name}</td>
											<td>
												{detail.exercise.descriptions}
											</td>
											<td>
												<img
													src={detail.exercise.image}
													alt={detail.exercise.name}
													className='exercise-image'
												/>
											</td>
										</tr>
									)
								)}
							</tbody>
						</table>
					</div>
				</Modal>
			)}

			<div className='table-container'>
				<table>
					<thead>
						<tr>
							<th>{t('table.athlete')}</th>
							<th>{t('table.competition')}</th>
							<th>{t('table.direction')}</th>
							<th>{t('table.age')}</th>
							<th>{t('table.actions')}</th>
						</tr>
					</thead>
					<tbody>
						{sortedParticipations.map((participation) => (
							<tr key={participation.id}>
								<td>
									{participation.Athlete?.lastName}{' '}
									{participation.Athlete?.firstName}
								</td>
								<td>{participation.Competition?.title}</td>
								<td>{participation.AthleteTrend?.trends}</td>
								<td>{participation.AthleteAge?.age}</td>
								<td>
									<button
										className='deteil-button'
										onClick={() => {
											handleDetailsClick(
												participation.id
											);
										}}>
										{t('button.details')}
									</button>
									<button
										className='detail-button'
										onClick={() =>
											openModal(participation.id)
										}>
										{t('button.edit')}
									</button>
									<button
										className='delete-button'
										onClick={() =>
											handleDeleteAthleteRegistration(
												participation.id
											)
										}>
										{t('button.delete')}
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default RegisterAthletePageCoach;
