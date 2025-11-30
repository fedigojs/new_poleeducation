import React, { useState, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
import CompetitionJudgementAPI from '../../api/CompetitionJudgementAPI';
import api from '../../api/api';
import CustomTable from '../Table/customTable';
import ModalJudgementDetails from '../modal/judgement/ModalJudgementDetails';
import ModalJudgement from '../modal/judgement/ModalJudgement';
import { Button, Space, Layout, Select } from 'antd';
import { SolutionOutlined, SearchOutlined } from '@ant-design/icons';
import Spinner from '../Spinner/Spinner';

const CompetitionJudgmentCouch = () => {
	const { user } = useContext(AuthContext);
	const queryClient = useQueryClient();
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(100);
	const [isDetailJudgementModalOpen, setIsDetailJudgementModalOpen] =
		useState(false);
	const [selectedParticipant, setSelectedParticipant] = useState(null);
	const [isJudgementModalOpen, setIsJudgementModalOpen] = useState(false);
	const [selectedCompetition, setSelectedCompetition] = useState('');

	const { data: competitions = [] } = useQuery({
		queryKey: ['competitions'],
		queryFn: async () => {
			const response = await api.get('/api/competition');
			return response.data;
		},
	});

	const {
		data: competitionList = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ['competitionList', selectedCompetition, user.userId],
		queryFn: async () => {
			if (!selectedCompetition) return [];
			const response = await api.get(
				`/api/draw-result/competition/${selectedCompetition}/coach/${user.userId}`
			);
			return response.data;
		},
		enabled: !!selectedCompetition && !!user?.userId,
	});

	const handleJudgeSubmit = async (e) => {
		e.preventDefault(); // Предотвращаем стандартное поведение формы

		// Собираем данные из формы
		const formData = {
			athleteId: selectedParticipant.participation.Athlete.id,
			score: e.target.score.value,
			comment: e.target.comment.value,
		};

		try {
			// Отправляем данные на сервер
			const response = await api.post('/api/voting', formData);
			if (response.status === 200) {
				console.log('Голос успешно зарегистрирован');
				// Здесь можно добавить дальнейшие действия, например, закрыть модальное окно
				closeJudgementModal();
			} else {
				console.error('Ошибка при отправке данных', response);
			}
		} catch (error) {
			console.error('Ошибка при отправке данных', error);
		}
	};

	const dataTable = competitionList.map((item) => ({
		key: item.participation.id,
		no: item.performanceOrder,
		performanceOrder: item.performanceOrder,
		timings: `${item.timing} - day ${item.competitionDay}`,
		sportsman: `${item.participation.Athlete.firstName} ${item.participation.Athlete.lastName}`,
		level: item.level?.name,
		ageGroup: item.participation.AthleteAge.age,
		athleteTrendName: item.participation.AthleteTrend.trends,
		totalScore: item.participation.totalResult
			? item.participation.totalResult.totalScore
			: null,
		competitionParticipationId: item.competitionParticipationId,
		participation: {
			AthleteTrend: item.participation.athleteTrendId,
			athleteId: item.participation.athleteId,
			competitionId: item.participation.competitionId,
			Athlete: {
				firstName: item.participation.Athlete.firstName,
				lastName: item.participation.Athlete.lastName,
			},
		},
	}));

	const distinctTrends = [
		...new Set(dataTable.map((item) => item.athleteTrendName)),
	].filter(Boolean);
	const trendsFilters = distinctTrends.map((trend) => ({
		text: trend,
		value: trend,
	}));

	const distinctLevels = [
		...new Set(dataTable.map((item) => item.level)),
	].filter(Boolean);
	const levelFilters = distinctLevels.map((l) => ({ text: l, value: l }));

	const distinctAgeGroups = [
		...new Set(dataTable.map((item) => item.ageGroup)),
	].filter(Boolean);
	const ageFilters = distinctAgeGroups.map((a) => ({ text: a, value: a }));

	const openDetailsModal = (record) => {
		const filteredData = {
			competitionParticipationId: record.competitionParticipationId,
		};
		setSelectedParticipant(filteredData);
		setIsDetailJudgementModalOpen(true);
	};

	const openJudgementModal = (record) => {
		setSelectedParticipant(record);
		setIsJudgementModalOpen(true);
	};

	const closeDetailsModal = () => {
		setIsDetailJudgementModalOpen(false);
		// Обновляем данные после закрытия деталей
		queryClient.invalidateQueries({ queryKey: ['competitionList'] });
	};

	const closeJudgementModal = () => {
		setIsJudgementModalOpen(false);
		// Обновляем данные после голосования
		queryClient.invalidateQueries({ queryKey: ['competitionList'] });
	};

	const columns = [
		{
			title: 'No',
			dataIndex: 'no',
			key: 'no',
			sorter: (a, b) => a.no - b.no,
			// render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
		},
		{
			title: 'Timings',
			dataIndex: 'timings',
			key: 'timings',
			// sorter: (a, b) => a.timings.localeCompare(b.timings),
		},
		{
			title: 'Sportsman',
			dataIndex: 'sportsman',
			key: 'sportsman',
			// sorter: (a, b) => a.sportsman.localeCompare(b.sportsman),
			filterDropdown: ({
				setSelectedKeys,
				selectedKeys,
				confirm,
				clearFilters,
			}) => (
				<div style={{ padding: 8 }}>
					<input
						placeholder='Search Sportsman'
						value={selectedKeys[0]}
						onChange={(e) =>
							setSelectedKeys(
								e.target.value ? [e.target.value] : []
							)
						}
						onPressEnter={() => confirm()} // Поиск при нажатии Enter
						style={{
							width: 188,
							marginBottom: 8,
							display: 'block',
						}}
					/>
					<Space>
						<Button
							type='primary'
							onClick={() => confirm()}
							icon={<SearchOutlined />}
							size='small'
							style={{ width: 90 }}>
							Search
						</Button>
						<Button
							onClick={() => {
								clearFilters();
								confirm();
							}}
							size='small'
							style={{ width: 90 }}>
							Reset
						</Button>
					</Space>
				</div>
			),
			onFilter: (value, record) =>
				record.sportsman.toLowerCase().includes(value.toLowerCase()), // Фильтрация по совпадению текста
		},
		{
			title: 'AthleteTrend',
			dataIndex: 'athleteTrendName',
			key: 'athleteTrendName',
			sorter: (a, b) =>
				a.athleteTrendName.localeCompare(b.athleteTrendName),
			filters: trendsFilters,
			onFilter: (value, record) => record.athleteTrendName === value,
		},
		{
			title: 'Level',
			dataIndex: 'level',
			key: 'level',
			sorter: (a, b) => a.level.localeCompare(b.level),
			filters: levelFilters,
			onFilter: (value, record) => record.level === value,
		},
		{
			title: 'AgeGroup',
			dataIndex: 'ageGroup',
			key: 'ageGroup',
			sorter: (a, b) => a.ageGroup - b.ageGroup,
			filters: ageFilters,
			onFilter: (value, record) => record.ageGroup === value,
		},
		{
			title: 'TotalScore',
			dataIndex: 'totalScore',
			key: 'totalScore',
			sorter: (a, b) => a.totalScore - b.totalScore,
			render: (totalScore) =>
				totalScore !== null && totalScore !== undefined
					? parseFloat(totalScore).toFixed(2)
					: '',
		},
		{
			title: 'Action',
			dataIndex: 'action',
			key: 'action',
			render: (_, record) => (
				<Space>
					<Button
						type='link'
						icon={<SolutionOutlined />}
						onClick={() => openDetailsModal(record)}
					/>
				</Space>
			),
		},
	];

	return (
		<Layout className='layout'>
			<h1>Competition Judgment</h1>

			<div
				style={{
					marginBottom: '20px',
					display: 'flex',
					gap: '10px',
					alignItems: 'center',
				}}>
				<span style={{ fontWeight: 'bold' }}>Змагання:</span>
				<Select
					style={{ width: 300 }}
					placeholder='Виберіть змагання'
					value={selectedCompetition || undefined}
					onChange={(value) => setSelectedCompetition(value)}
					allowClear
					onClear={() => setSelectedCompetition('')}>
					{competitions.map((competition) => (
						<Select.Option
							key={competition.id}
							value={competition.id}>
							{competition.title}
						</Select.Option>
					))}
				</Select>
				{selectedCompetition && (
					<span style={{ color: '#666' }}>
						Показано: {dataTable.length} учасників
					</span>
				)}
			</div>

			{!selectedCompetition && (
				<div
					style={{
						textAlign: 'center',
						padding: '60px 20px',
						backgroundColor: '#f5f5f5',
						borderRadius: '8px',
					}}>
					<p style={{ fontSize: '16px', color: '#666', margin: 0 }}>
						Будь ласка, виберіть змагання для відображення учасників
					</p>
				</div>
			)}

			{selectedCompetition && (
				<>
					{isLoading && <Spinner />}
					{error && (
						<p style={{ color: 'red' }}>
							Помилка завантаження даних: {error.message}
						</p>
					)}
					{!isLoading && !error && (
						<CustomTable
							dataSource={dataTable}
							columns={columns}
							rowKey='key'
							pagination={{
								pageSize,
								onChange: (page, size) => {
									setCurrentPage(page);
									setPageSize(size);
								},
							}}
						/>
					)}
				</>
			)}

			<ModalJudgementDetails
				isOpen={isDetailJudgementModalOpen}
				onClose={closeDetailsModal}
				competitionParticipationId={
					selectedParticipant?.competitionParticipationId || null
				}
			/>

			{user && (
				<ModalJudgement
					isOpen={isJudgementModalOpen}
					onClose={closeJudgementModal}
					participant={selectedParticipant}
					competitionParticipationId={
						selectedParticipant?.competitionParticipationId
					}
					onSubmit={handleJudgeSubmit}
					judgeId={user.userId}
				/>
			)}
		</Layout>
	);
};

export default CompetitionJudgmentCouch;
