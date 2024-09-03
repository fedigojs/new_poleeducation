import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import api from '../../api/api';
import html2pdf from 'html2pdf.js';
import './TestExercise.css'; // Подключаем файл со стилями

export const TestExercise = () => {
	const [allExercises, setAllExercises] = useState([]);
	const [filteredExercises, setFilteredExercises] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState('');
	const [selectedDirection, setSelectedDirection] = useState('');
	const [selectedName, setSelectedName] = useState('');
	const [selectedExercises, setSelectedExercises] = useState([]);
	const [tableData, setTableData] = useState([]);
	const [name, setName] = useState('');
	const [ageCategory, setAgeCategory] = useState('');

	useEffect(() => {
		const loadExercises = async () => {
			try {
				const response = await api.get('/api/exercise');
				const options = response.data.map((ex) => ({
					value: ex.id,
					label: `${ex.code} - ${ex.name}`,
					level: ex.level.id,
					discipline: ex.discipline.id,
					image: ex.image,
					description: ex.descriptions,
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
				(selectedCategory === '' ||
					ex.level === parseInt(selectedCategory)) &&
				(selectedDirection === '' ||
					ex.discipline === parseInt(selectedDirection))
		);
		setFilteredExercises(filtered);
	}, [selectedCategory, selectedDirection, allExercises]);

	const addAllSelectedExercisesToTable = () => {
		const newTableData = selectedExercises.map((ex) => ({
			code: ex.label.split(' - ')[0],
			name: ex.label.split(' - ')[1],
			image: ex.image,
			description: ex.description || '',
		}));

		setTableData((prevTableData) => [...prevTableData, ...newTableData]);
	};

	const removeLastRow = () => {
		if (tableData.length > 0) {
			setTableData((prevTableData) => prevTableData.slice(0, -1));
		} else {
			alert('В таблице нет строк для удаления.');
		}
	};

	const handleExerciseChange = (selectedOptions) => {
		setSelectedExercises(selectedOptions || []);
	};

	const saveAsPDF = () => {
		const element = document.getElementById('pdfprint');
		const opt = {
			margin: [0.5, 0.5],
			filename: 'myfile.pdf',
			image: { type: 'jpeg', quality: 0.98 },
			html2canvas: { scale: 2, letterRendering: true, useCORS: true },
			jsPDF: { unit: 'in', format: 'a3', orientation: 'portrait' },
		};
		html2pdf().set(opt).from(element).save();
	};

	return (
		<div className='container'>
			<div id='pdfprint'>
				<div className='info-section'>
					<div className='form-row'>
						<div className='form-group'>
							<label
								htmlFor='name'
								className='form-label'>
								Імʼя:
							</label>
							<input
								type='text'
								className='form-input'
								id='name'
								placeholder='Ваше імʼя'
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>

						<div className='form-group'>
							<label
								htmlFor='age-category'
								className='form-label'>
								Вікова категорія:
							</label>
							<input
								type='text'
								className='form-input'
								id='age-category'
								placeholder='Вікова категорія'
								value={ageCategory}
								onChange={(e) => setAgeCategory(e.target.value)}
							/>
						</div>

						<div className='form-group'>
							<label
								htmlFor='scategory'
								className='form-label'>
								Розряд:
							</label>
							<select
								id='scategory'
								className='form-input'
								value={selectedCategory}
								onChange={(e) =>
									setSelectedCategory(e.target.value)
								}>
								<option value=''>Усі розряди</option>
								<option value='1'>Дебют</option>
								<option value='2'>Аматор</option>
								<option value='3'>Напівпрофі</option>
								<option value='4'>Профі</option>
								<option value='5'>Еліт</option>
							</select>
						</div>

						<div className='form-group'>
							<label
								htmlFor='direction'
								className='form-label'>
								Напрямок:
							</label>
							<select
								className='form-input'
								id='direction'
								value={selectedDirection}
								onChange={(e) =>
									setSelectedDirection(e.target.value)
								}>
								<option value=''>Усі напрямки</option>
								<option value='1'>Пілон</option>
								<option value='2'>Кільце</option>
								<option value='3'>Полотна</option>
							</select>
						</div>

						<div className='form-group exercise-group'>
							<label
								htmlFor='exercise'
								className='form-label'>
								Упражнение:
							</label>
							<Select
								id='exercise'
								isMulti
								options={filteredExercises}
								value={selectedExercises}
								onChange={handleExerciseChange}
								classNamePrefix='select'
								styles={{
									container: (provided) => ({
										...provided,
										width: '100%',
									}),
								}}
							/>
						</div>
					</div>
				</div>

				<table className='custom-table'>
					<thead>
						<tr>
							<th>№</th>
							<th>Код</th>
							<th>Назва</th>
							<th>Елемент</th>
							<th>Тех цінність</th>
							<th>Опис</th>
						</tr>
					</thead>
					<tbody>
						{tableData.map((row, index) => (
							<tr key={index}>
								<td>{index + 1}</td>
								<td>{row.code}</td>
								<td>{row.name}</td>
								<td>
									<img
										src={row.image}
										alt='Изображение'
										style={{ width: '150px' }}
									/>
								</td>
								<td>{row.tValue}</td>
								<td
									dangerouslySetInnerHTML={{
										__html: row.description,
									}}
								/>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className='button-group'>
				<button
					className='button primary'
					type='button'
					onClick={addAllSelectedExercisesToTable}>
					Додати всі обрані вправи в таблицю
				</button>
				<button
					className='button secondary'
					type='button'
					onClick={removeLastRow}>
					Видалити останній рядок
				</button>
				<button
					className='button success'
					type='button'
					onClick={saveAsPDF}>
					Зберегти як PDF
				</button>
			</div>
		</div>
	);
};
