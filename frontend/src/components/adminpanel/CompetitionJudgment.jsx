import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CompetitionJudgementAPI from '../../api/CompetitionJudgementAPI';
import CustomTable from '../Table/customTable';
import ModalJudgementDetails from '../modal/judgement/ModalJudgementDetails';
import { Button, Space } from 'antd';
import {
	SolutionOutlined,
	LikeOutlined,
	SoundOutlined,
	MessageOutlined,
} from '@ant-design/icons';
import Spinner from '../Spinner/Spinner';

const CompetitionJudgment = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(100);
	const [isDetailJudgementModalOpen, setIsDetailJudgementModalOpen] =
		useState(false);
	const [selectedParticipant, setSelectedParticipant] = useState(null);

	const {
		data: competitionList = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ['competitionList'],
		queryFn: async () => await CompetitionJudgementAPI.listAllJudgement(),
	});

	if (isLoading) return <Spinner />;
	if (error) return <p>Error loading data: {error.message}</p>;

	const dataTable = competitionList.map((item, index) => ({
		key: item.participation.id,
		no: index + 1,
		timings: `${item.timing} - day ${item.competitionDay}`,
		sportsman: `${item.participation.Athlete.firstName} ${item.participation.Athlete.lastName}`,
		level: item.level.name,
		ageGroup: item.participation.AthleteAge.age,
		totalScore: item.totalscore,
		protocols: item.protocol,
		competitionParticipationId: item.competitionParticipationId,
	}));

	// Получаем уникальные значения для фильтров Level и AgeGroup
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

	const closeDetailsModal = () => {
		setIsDetailJudgementModalOpen(false);
	};

	const columns = [
		{
			title: 'No',
			dataIndex: 'no',
			key: 'no',
			render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
		},
		{
			title: 'Timings',
			dataIndex: 'timings',
			key: 'timings',
		},
		{
			title: 'Sportsman',
			dataIndex: 'sportsman',
			key: 'sportsman',
		},
		{
			title: 'Level',
			dataIndex: 'level',
			key: 'level',
			filters: levelFilters,
			onFilter: (value, record) => record.level === value,
		},
		{
			title: 'AgeGroup',
			dataIndex: 'ageGroup',
			key: 'ageGroup',
			filters: ageFilters,
			onFilter: (value, record) => record.ageGroup === value,
		},
		{
			title: 'TotalScore',
			dataIndex: 'totalScore',
			key: 'totalScore',
		},
		{
			title: 'Protocols',
			dataIndex: 'protocols',
			key: 'protocols',
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
					<Button
						type='link'
						icon={<LikeOutlined />}
						onClick={() => console.log('Edit', record)}
					/>
					<Button
						type='link'
						icon={<SoundOutlined />}
						onClick={() => console.log('Delete', record)}
					/>
					<Button
						type='link'
						icon={<MessageOutlined />}
						onClick={() => console.log('Voting', record)}
					/>
				</Space>
			),
		},
	];

	return (
		<>
			<h1>Competition Judgment</h1>
			<CustomTable
				dataSource={dataTable}
				columns={columns}
				rowKey='id'
				pagination={{
					pageSize,
					onChange: (page, size) => {
						setCurrentPage(page);
						setPageSize(size);
					},
				}}
			/>

			<ModalJudgementDetails
				isOpen={isDetailJudgementModalOpen}
				onClose={closeDetailsModal}
				competitionParticipationId={
					selectedParticipant?.competitionParticipationId
				}
			/>
		</>
	);
};

export default CompetitionJudgment;
