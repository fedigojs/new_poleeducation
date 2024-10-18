import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { Button, Container } from 'react-bootstrap';
import AthleteRegistrationModal from '../modal/AthleteRegistrationModal';
import ExerciseDetailsModal from '../modal/ExerciseDetailsModal';
import { useTranslation } from 'react-i18next';

const RegisterAthletePage = () => {
	const { t } = useTranslation();
	const [competitions, setCompetitions] = useState([]);
	const [athletes, setAthletes] = useState([]);
	const [athleteAge, setAthleteAge] = useState([]);
	const [athleteTrend, setAthleteTrend] = useState([]);
	const [participations, setParticipations] = useState([]);
	const [levels, setLevels] = useState([]);
	const [disciplines, setDisciplines] = useState([]);
	const [allExercises, setAllExercises] = useState([]);
	const [detailExercises, setDetailExercises] = useState([]);
	const [selectedParticipationDetails, setSelectedParticipationDetails] =
		useState(null);
	const [isRegistrationModalVisible, setIsRegistrationModalVisible] =
		useState(false);
	const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
	const [editingParticipation, setEditingParticipation] = useState(null);
	const [initialValues, setInitialValues] = useState({
		athleteId: '',
		competitionId: '',
		athleteAgeId: '',
		athleteTrendId: '',
		levelId: '',
		selectedExercises: [],
		disciplineId: '',
	});
	const [error, setError] = useState('');

	useEffect(() => {
		loadInitialData();
	}, []);

	useEffect(() => {
		loadParticipations();
	}, [participations.length]);

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
				api.get('/api/athletes'),
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
			console.error('Ошибка при загрузке данных:', err);
			setError('Не удалось загрузить данные.');
		}
	};

	const loadParticipations = async () => {
		try {
			const response = await api.get('/api/comp-part');
			setParticipations(response.data);
		} catch (err) {
			console.error('Ошибка при загрузке участников:', err);
			setError('Не удалось загрузить участников.');
		}
	};

	const handleRegister = async (formData) => {
		try {
			let response;
			if (editingParticipation) {
				// Если редактируем существующую регистрацию
				response = await api.put(
					`/api/comp-part/${editingParticipation.id}`,
					formData
				);
				setParticipations((prev) =>
					prev.map((p) =>
						p.id === editingParticipation.id
							? { ...p, ...response.data }
							: p
					)
				);
			} else {
				// Если создаем новую регистрацию
				response = await api.post('/api/comp-part', formData);
				setParticipations((prevParticipations) => [
					...prevParticipations,
					response.data,
				]);
			}

			setIsRegistrationModalVisible(false); // Закрываем модальное окно после успешной регистрации
			resetForm();
			window.location.reload();
		} catch (err) {
			console.error('Ошибка при регистрации:', err);
			setError(
				err.response?.data.message || 'Произошла ошибка при регистрации'
			);
		}
	};

	// Открыть модальное окно регистрации
	const openModal = (participationId = null) => {
		if (participationId) {
			// Редактирование существующего участника
			const participation = participations.find(
				(p) => p.id === participationId
			);
			setInitialValues({
				athleteId: participation.athleteId,
				competitionId: participation.competitionId,
				athleteAgeId: participation.athleteAgeId,
				athleteTrendId: participation.athleteTrendId,
				levelId: participation.levelId,
				selectedExercises: participation.exercises.map((ex) => ({
					value: ex.id,
					label: `${ex.name}`,
				})),
				disciplineId: participation.disciplineId,
			});
			setEditingParticipation(participation);
		} else {
			resetForm();
		}
		setIsRegistrationModalVisible(true);
	};

	// Закрыть модальное окно и сбросить форму
	const closeModal = () => {
		setIsRegistrationModalVisible(false);
		resetForm();
	};

	// Сброс формы
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

	// Удаление участника
	const handleDeleteAthleteRegistration = async (participationId) => {
		if (window.confirm('Вы уверены, что хотите удалить этого участника?')) {
			try {
				await api.delete(`/api/comp-part/${participationId}`);
				loadParticipations();
			} catch (error) {
				console.error('Ошибка при удалении участника:', error);
				setError(
					error.response?.data.message ||
						'Произошла ошибка при удалении'
				);
			}
		}
	};

	// Сортировка участников по фамилии
	const sortParticipations = (participations) => {
		return participations.sort((a, b) => {
			const lastNameA = a.Athlete?.lastName.toLowerCase() || '';
			const lastNameB = b.Athlete?.lastName.toLowerCase() || '';
			if (lastNameA < lastNameB) return -1;
			if (lastNameA > lastNameB) return 1;
			return 0;
		});
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

	const sortedParticipations = sortParticipations(participations);

	return (
		<Container>
			<h1>Регистрация спортсмена на соревнование</h1>
			<Button
				variant='success'
				onClick={() => openModal(null)}>
				Регистрация
			</Button>

			{isRegistrationModalVisible && (
				<AthleteRegistrationModal
					isVisible={isRegistrationModalVisible}
					onClose={closeModal}
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
							<th>Атлет</th>
							<th>Соревнование</th>
							<th>Направление</th>
							<th>Возраст</th>
							<th>Действие</th>
						</tr>
					</thead>
					<tbody>
						{sortedParticipations.map((participation, index) => (
							<tr key={participation.id}>
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
										onClick={() =>
											handleDetailsClick(participation.id)
										}>
										<i className='bi bi-file-earmark-text'></i>
									</Button>

									<Button
										className='m-1'
										variant='warning'
										onClick={() =>
											openModal(participation.id)
										}>
										<i className='bi bi-pencil'></i>
									</Button>
									<Button
										className='m-1'
										variant='danger'
										onClick={() =>
											handleDeleteAthleteRegistration(
												participation.id
											)
										}>
										<i className='bi bi-trash'></i>
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

export default RegisterAthletePage;
