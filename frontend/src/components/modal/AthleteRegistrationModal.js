import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import Modal from '../Modal';
import { Form, Button, Col } from 'react-bootstrap';

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
		console.log('Initial values for editing:', initialValues);

		setAthleteId(initialValues.athleteId || '');
		setCompetitionId(initialValues.competitionId || '');
		setAthleteAgeId(initialValues.athleteAgeId || '');
		setAthleteTrendId(initialValues.athleteTrendId || '');
		setLevelId(initialValues.levelId || '');
		setSelectedExercises(initialValues.selectedExercises || []);
		setDisciplineId(initialValues.disciplineId || '');
	}, [initialValues]);

	const handleRegisterSubmit = async (e) => {
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
		console.log('This:', postData);

		try {
			await onSubmit(postData);
			onClose();
		} catch (err) {
			console.error('Error during registration:', err);
			setError(
				err.response?.data.message ||
					'Произошла ошибка при регистрации!!!'
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
			<Form onSubmit={handleRegisterSubmit}>
				<Button
					variant='secondary'
					className='modal-close-button'
					onClick={onClose}>
					&times;
				</Button>
				<h3 className='text-center mb-4'>
					{editingParticipation
						? 'Редактировать участника'
						: 'Регистрация участника'}
				</h3>

				<Form.Group
					as={Col}
					controlId='athlete'>
					<Form.Label>Атлет</Form.Label>
					<Form.Control
						as='select'
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
					</Form.Control>
				</Form.Group>

				<Form.Group
					as={Col}
					controlId='competition'>
					<Form.Label>Соревнование</Form.Label>
					<Form.Control
						as='select'
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
					</Form.Control>
				</Form.Group>

				<Form.Group
					as={Col}
					controlId='trends'>
					<Form.Label>Направление</Form.Label>
					<Form.Control
						as='select'
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
					</Form.Control>
				</Form.Group>

				<Form.Group
					as={Col}
					controlId='ages'>
					<Form.Label>Возраст</Form.Label>
					<Form.Control
						as='select'
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
					</Form.Control>
				</Form.Group>

				<Form.Group
					as={Col}
					controlId='level'>
					<Form.Label>Мастерство</Form.Label>
					<Form.Control
						as='select'
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
					</Form.Control>
				</Form.Group>

				<Form.Group
					as={Col}
					controlId='discipline'>
					<Form.Label>Дисциплина</Form.Label>
					<Form.Control
						as='select'
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
					</Form.Control>
				</Form.Group>

				<Form.Group
					as={Col}
					controlId='exercise'>
					<Form.Label>Упражнение</Form.Label>
					<Select
						id='exercise'
						isMulti
						options={filteredExercises}
						value={selectedExercises}
						onChange={handleExerciseChange}
						className='basic-multi-select'
						classNamePrefix='select'
					/>
				</Form.Group>

				<div className='form-actions d-flex justify-content-between'>
					<Button
						className='m-4'
						type='submit'
						variant='primary'>
						{editingParticipation ? 'Обновить' : 'Зарегистрировать'}
					</Button>
					<Button
						className='m-4'
						variant='secondary'
						onClick={onClose}>
						Отмена
					</Button>
				</div>

				{error && <p className='text-danger mt-2'>{error}</p>}
			</Form>
		</Modal>
	);
};

export default AthleteRegistrationModal;
