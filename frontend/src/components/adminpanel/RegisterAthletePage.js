import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import api from '../../api/api';
import Modal from '../Modal'; // Убедитесь, что путь к модальному окну верный

const RegisterAthletePage = () => {
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
	const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
	const [editingParticipation, setEditingParticipation] = useState(null);

	useEffect(() => {
		loadInitialData();
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
				console.error('Ошибка при загрузке упражнений:', error);
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
			console.error('Ошибка при загрузке данных All:', err);
			setError('Не удалось загрузить начальные данные.');
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
				console.log(
					'Регистрация спортсмена успешно выполнена!'
					// response.data
				);

				setParticipations((prevParticipations) => [
					...prevParticipations,
					response.data,
				]);
			}

			setIsRegistrationModalVisible(false); // Закрываем модальное окно после регистрации
			setParticipations([...participations, response.data]); // Добавляем нового участника в список
			closeModal();
		} catch (err) {
			console.error('Ошибка при регистрации:', err);
			setError(
				err.response?.data.message || 'Произошла ошибка при регистрации'
			);
		}
	};
	const handleExerciseChange = (selectedOptions) => {
		setSelectedExercises(selectedOptions || []);
	};

	// Функция для загрузки участников соревнований
	const loadParticipations = async () => {
		try {
			const response = await api.get('/api/comp-part');
			setParticipations(response.data);
		} catch (err) {
			console.error('Ошибка при загрузке участников:', err);
			setError('Не удалось загрузить участников.');
		}
	};

	const handleDeleteAthleteRegistration = async (participationId) => {
		if (window.confirm('Вы уверены, что хотите удалить этого атлета?')) {
			try {
				await api.delete(`/api/comp-part/${participationId}`);
				console.log('Регистрация атлета успешно удалена!');
				loadParticipations();
			} catch (error) {
				console.error(
					'Ошибка при удалении участия в соревнованиях',
					error
				);
				setError(
					error.response?.data.message ||
						'Произонла ошибка при удалении'
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
			return currentDetails; // возвращаем неизмененный текущий стейт
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
				console.error('Ошибка при загрузке данных участника:', error);
				setError('Не удалось загрузить данные участника.');
			}
		} else {
			resetForm(); // Сброс формы для создания нового участника
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
		setEditingParticipation(null); // Обязательно сбросьте это состояние
	};

	// Функция для сортировки участников по алфавиту
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
		<div>
			<h1>Регистрация спортсмена на соревнование</h1>
			<button
				className='edit-button'
				onClick={() => setIsRegistrationModalVisible(true)}>
				Регистрация
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
								? 'Редактировать участника'
								: 'Регистрация участника'}
						</h3>
						<label htmlFor='athlete'>Атлет:</label>
						<select
							id='athlete'
							value={athleteId}
							onChange={(e) => setAthleteId(e.target.value)}
							required>
							<option value=''>Выберите участника</option>
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

						<label htmlFor='competition'>Соревнование:</label>
						<select
							id='competition'
							value={competitionId}
							onChange={(e) => setCompetitionId(e.target.value)}
							required>
							<option value=''>Выберите соревнование</option>
							{competitions.map((competition) => (
								<option
									key={competition.id}
									value={competition.id}>
									{competition.title}
								</option>
							))}
						</select>
						<label htmlFor='trends'>Напрям:</label>
						<select
							id='trends'
							value={athleteTrendId}
							onChange={(e) => setAthleteTrendId(e.target.value)}
							required>
							<option value=''>Виберіть напрям</option>
							{athleteTrend.map((trends) => (
								<option
									key={trends.id}
									value={trends.id}>
									{trends.trends}
								</option>
							))}
						</select>
						<label htmlFor='ages'>Вік:</label>
						<select
							id='ages'
							value={athleteAgeId}
							onChange={(e) => setAthleteAgeId(e.target.value)}
							required>
							<option value=''>Виберіть вік</option>
							{athleteAge.map((ages) => (
								<option
									key={ages.id}
									value={ages.id}>
									{ages.age}
								</option>
							))}
						</select>

						<label htmlFor='level'>Мастерство:</label>
						<select
							id='level'
							value={levelId}
							onChange={(e) => setLevelId(e.target.value)}
							required>
							<option value=''>
								Выберите уровень мастерства
							</option>
							{levels.map((level) => (
								<option
									key={level.id}
									value={level.id}>
									{level.name}
								</option>
							))}
						</select>

						<label htmlFor='discipline'>Дисциплина:</label>
						<select
							id='discipline'
							value={disciplineId}
							onChange={(e) => setDisciplineId(e.target.value)}
							required>
							<option value=''>Выберите дисциплину</option>
							{disciplines.map((discipline) => (
								<option
									key={discipline.id}
									value={discipline.id}>
									{discipline.name}
								</option>
							))}
						</select>

						<label htmlFor='exercise'>Упражнение:</label>
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
									? 'Обновить'
									: 'Зарегистрировать'}
							</button>
							<button
								type='button'
								onClick={closeModal}>
								Отмена
							</button>
						</div>

						{error && <p className='error-message'>{error}</p>}
					</form>
				</Modal>
			)}

			{isDetailsModalVisible && selectedParticipationDetails && (
				<Modal onClose={() => setIsDetailsModalVisible(false)}>
					<div className='modal-content'>
						<button
							className='modal-close-button'
							onClick={() => setIsDetailsModalVisible(false)}>
							&times; {/* Кнопка закрыть */}
						</button>
						<h3>Детали упражнений</h3>
						<h2>Атлет:</h2>
						<table className='details-table'>
							<thead>
								<tr>
									<th>Упражнение</th>
									<th>Описание</th>
									<th>Изображение</th>
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
							<th>Атлет</th>
							<th>Соревнования</th>
							<th>Направление</th>
							<th>Возраст</th>
							<th>Действие</th>
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
										Детали
									</button>
									<button
										className='detail-button'
										onClick={() =>
											openModal(participation.id)
										}>
										Редактировать
									</button>
									<button
										className='delete-button'
										onClick={() =>
											handleDeleteAthleteRegistration(
												participation.id
											)
										}>
										Удалить
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

export default RegisterAthletePage;
