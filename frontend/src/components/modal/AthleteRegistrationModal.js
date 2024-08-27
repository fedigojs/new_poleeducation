// src/components/AthleteRegistrationModal.js
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Modal from '../Modal';

const AthleteRegistrationModal = ({
	isVisible,
	onClose,
	onSubmit,
	athletes,
	competitions,
	athleteTrend,
	athleteAge,
	levels,
	disciplines,
	allExercises,
	editingParticipation,
	initialValues,
}) => {
	const [athleteId, setAthleteId] = useState(initialValues.athleteId || '');
	const [competitionId, setCompetitionId] = useState(
		initialValues.competitionId || ''
	);
	const [athleteAgeId, setAthleteAgeId] = useState(
		initialValues.athleteAgeId || ''
	);
	const [athleteTrendId, setAthleteTrendId] = useState(
		initialValues.athleteTrendId || ''
	);
	const [levelId, setLevelId] = useState(initialValues.levelId || '');
	const [selectedExercises, setSelectedExercises] = useState(
		initialValues.selectedExercises || []
	);
	const [disciplineId, setDisciplineId] = useState(
		initialValues.disciplineId || ''
	);
	const [error, setError] = useState('');

	useEffect(() => {
		setAthleteId(initialValues.athleteId || '');
		setCompetitionId(initialValues.competitionId || '');
		setAthleteAgeId(initialValues.athleteAgeId || '');
		setAthleteTrendId(initialValues.athleteTrendId || '');
		setLevelId(initialValues.levelId || '');
		setSelectedExercises(initialValues.selectedExercises || []);
		setDisciplineId(initialValues.disciplineId || '');
	}, [initialValues]);

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
			await onSubmit(postData);
			onClose();
		} catch (err) {
			setError(
				err.response?.data.message || 'Произошла ошибка при регистрации'
			);
		}
	};

	const handleExerciseChange = (selectedOptions) => {
		setSelectedExercises(selectedOptions || []);
	};

	const filteredExercises = allExercises.filter(
		(ex) =>
			(levelId === '' || ex.level === parseInt(levelId)) &&
			(disciplineId === '' || ex.discipline === parseInt(disciplineId))
	);

	return (
		<Modal
			onClose={onClose}
			isVisible={isVisible}
			className='narrow-modal'>
			<form
				onSubmit={handleRegister}
				className='register-form'>
				<button
					className='modal-close-button'
					onClick={onClose}>
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
						.sort((a, b) => a.lastName.localeCompare(b.lastName))
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

				<label htmlFor='trends'>Направление:</label>
				<select
					id='trends'
					value={athleteTrendId}
					onChange={(e) => setAthleteTrendId(e.target.value)}
					required>
					<option value=''>Выберите направление</option>
					{athleteTrend.map((trend) => (
						<option
							key={trend.id}
							value={trend.id}>
							{trend.trends}
						</option>
					))}
				</select>

				<label htmlFor='ages'>Возраст:</label>
				<select
					id='ages'
					value={athleteAgeId}
					onChange={(e) => setAthleteAgeId(e.target.value)}
					required>
					<option value=''>Выберите возраст</option>
					{athleteAge.map((age) => (
						<option
							key={age.id}
							value={age.id}>
							{age.age}
						</option>
					))}
				</select>

				<label htmlFor='level'>Мастерство:</label>
				<select
					id='level'
					value={levelId}
					onChange={(e) => setLevelId(e.target.value)}
					required>
					<option value=''>Выберите уровень мастерства</option>
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
						{editingParticipation ? 'Обновить' : 'Зарегистрировать'}
					</button>
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

export default AthleteRegistrationModal;
