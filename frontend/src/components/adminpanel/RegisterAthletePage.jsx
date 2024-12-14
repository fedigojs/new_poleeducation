import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { Button, Space, Spin, Popconfirm } from 'antd';
import CustomTable from '../Table/customTable';
import {
	FileTextOutlined,
	DownloadOutlined,
	EditOutlined,
	DeleteOutlined,
	DollarCircleOutlined,
} from '@ant-design/icons';
import AthleteRegistrationModal from '../modal/AthleteRegistrationModal';
import ExerciseDetailsModal from '../modal/ExerciseDetailsModal';
import UploadedFilesModal from '../modal/UploadedFilesModal';
import { useTranslation } from 'react-i18next';
import './RegisterAthletePage.css';

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
	const [payCompetitions, setPayCompetitions] = useState({});
	const [selectedParticipationDetails, setSelectedParticipationDetails] =
		useState(null);
	const [isRegistrationModalVisible, setIsRegistrationModalVisible] =
		useState(false);
	const [isFilesModalVisible, setIsFilesModalVisible] = useState(false);
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
		isPaid: false,
		uploadedFiles: [],
	});
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [selectedFiles, setSelectedFiles] = useState([]);
	const role = localStorage.getItem('role');
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(100);

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			try {
				await Promise.all([loadInitialData(), loadParticipations()]);
			} catch (err) {
				console.error('Ошибка при загрузке данных:', err);
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, []);

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
			const payStatus = response.data.reduce((acc, participation) => {
				acc[participation.id] = participation.isPaid;
				return acc;
			}, {});
			setPayCompetitions(payStatus);
		} catch (err) {
			console.error('Ошибка при загрузке участников:', err);
			setError('Не удалось загрузить участников.');
		}
	};

	const handleRegister = async (formData) => {
		try {
			let response;
			if (editingParticipation) {
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
				response = await api.post('/api/comp-part', formData);
				setParticipations((prevParticipations) => [
					...prevParticipations,
					response.data,
				]);
			}

			setIsRegistrationModalVisible(false);
			resetForm();
		} catch (err) {
			console.error('Ошибка при регистрации:', err);
			setError(
				err.response?.data.message || 'Произошла ошибка при регистрации'
			);
		}
	};

	const openModal = (participationId = null) => {
		if (participationId) {
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
					label: ex.name,
				})),
				disciplineId: participation.disciplineId,
				uploadedFiles: participation.uploadedFiles || [],
			});
			setEditingParticipation(participation);
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

	const handleShowFiles = (uploadedFiles, participation) => {
		setSelectedFiles(uploadedFiles);
		setIsFilesModalVisible(true);
		setEditingParticipation(participation);
	};

	const closeFilesModal = () => {
		setIsFilesModalVisible(false);
		setSelectedFiles([]);
	};

	const handleDeleteAthleteRegistration = async (participationId) => {
		try {
			await api.delete(`/api/comp-part/${participationId}`);
			loadParticipations();
		} catch (error) {
			console.error('Ошибка при удалении участника:', error);
			setError(
				error.response?.data.message || 'Произошла ошибка при удалении'
			);
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

	const togglePayCompetition = async (participationId, currentIsPaid) => {
		try {
			const response = await api.patch(
				`/api/comp-part/${participationId}/ispaid`,
				{
					isPaid: !currentIsPaid,
				}
			);

			setPayCompetitions((prevState) => ({
				...prevState,
				[participationId]: response.data.isPaid,
			}));
		} catch (error) {
			console.error('Ошибка при обновлении статуса оплаты:', error);
		}
	};

	// Формируем фильтры для направления и возраста
	const distinctTrends = [
		...new Set(participations.map((p) => p.AthleteTrend?.trends)),
	].filter(Boolean);
	const trendFilters = distinctTrends.map((trend) => ({
		text: trend,
		value: trend,
	}));

	const distinctAges = [
		...new Set(participations.map((p) => p.AthleteAge?.age)),
	].filter(Boolean);
	const ageFilters = distinctAges.map((age) => ({
		text: age,
		value: age,
	}));

	// Формируем фильтры для тренера
	const distinctCoaches = [
		...new Set(
			participations.map((p) =>
				p.Athlete?.coach
					? `${p.Athlete.coach.lastName} ${p.Athlete.coach.firstName}`
					: ''
			)
		),
	]
		.filter(Boolean)
		.sort((a, b) => a.split(' ')[0].localeCompare(b.split(' ')[0]));

	const coachFilters = distinctCoaches.map((coach) => ({
		text: coach,
		value: coach,
	}));

	const columns = [
		{
			title: '№',
			dataIndex: 'index',
			key: 'index',
			render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
		},
		{
			title: 'Атлет',
			dataIndex: 'Athlete',
			key: 'Athlete',
			render: (Athlete) =>
				`${Athlete?.lastName || ''} ${Athlete?.firstName || ''}`,
		},
		{
			title: 'Тренер',
			dataIndex: ['Athlete', 'coach'],
			key: 'coach',
			filters: coachFilters,
			onFilter: (value, record) => {
				const coachName = record.Athlete?.coach
					? `${record.Athlete.coach.lastName} ${record.Athlete.coach.firstName}`
					: '';
				return coachName === value;
			},
			render: (coach) =>
				coach ? `${coach.lastName || ''} ${coach.firstName || ''}` : '',
		},
		{
			title: 'Соревнование',
			dataIndex: ['Competition', 'title'],
			key: 'Competition',
		},
		{
			title: 'Направление',
			dataIndex: ['AthleteTrend', 'trends'],
			key: 'AthleteTrend',
			filters: trendFilters,
			onFilter: (value, record) => record.AthleteTrend?.trends === value,
		},
		{
			title: 'Возраст',
			dataIndex: ['AthleteAge', 'age'],
			key: 'AthleteAge',
			filters: ageFilters,
			onFilter: (value, record) => record.AthleteAge?.age === value,
		},
		{
			title: 'Действие',
			key: 'action',
			render: (text, record) => (
				<Space>
					<Button
						icon={<FileTextOutlined />}
						onClick={() => handleDetailsClick(record.id)}
					/>
					<Button
						icon={<DownloadOutlined />}
						onClick={() =>
							handleShowFiles(record.uploadedFiles, record)
						}
						className={
							record.uploadedFiles?.length > 0
								? 'button-blue'
								: ''
						}
					/>
					<Button
						icon={<EditOutlined />}
						onClick={() => openModal(record.id)}
					/>
					<Popconfirm
						title='Вы уверены, что хотите удалить этого участника?'
						okText='Да'
						cancelText='Нет'
						onConfirm={() =>
							handleDeleteAthleteRegistration(record.id)
						}>
						<Button
							icon={<DeleteOutlined />}
							danger
						/>
					</Popconfirm>
					{role === 'Admin' && (
						<Popconfirm
							title='Вы уверены, что хотите удалить изменить статус оплаты?'
							okText='Да'
							cancelText='Нет'
							onConfirm={() =>
								togglePayCompetition(
									record.id,
									payCompetitions[record.id]
								)
							}>
							<Button icon={<DollarCircleOutlined />} />
						</Popconfirm>
					)}
				</Space>
			),
		},
	];

	return (
		<div style={{ padding: '16px' }}>
			<h1>{t('h1.athleteRegistration')}</h1>
			{isLoading ? (
				<div className='spinner-container'>
					<Spin size='large' />
				</div>
			) : (
				<>
					<Button
						type='primary'
						className='m-4'
						onClick={() => openModal(null)}>
						{t('button.registrationNoun')}
					</Button>
				</>
			)}

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

			<CustomTable
				columns={columns}
				dataSource={participations.map((item) => ({
					...item,
					key: item.id,
				}))}
				rowClassName={(record) =>
					payCompetitions[record.id] ? 'paid-row' : ''
				}
				pagination={{
					pageSize,
					onChange: (page, size) => {
						setCurrentPage(page);
						setPageSize(size);
					},
				}}
			/>

			<UploadedFilesModal
				isVisible={isFilesModalVisible}
				onClose={closeFilesModal}
				files={selectedFiles}
				editingParticipation={editingParticipation}
				t={t}
			/>
		</div>
	);
};

export default RegisterAthletePage;
