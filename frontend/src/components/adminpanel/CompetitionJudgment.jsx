import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CompetitionJudgementAPI from '../../api/CompetitionJudgementAPI';
import CustomTable from '../Table/customTable';
import { Button, Space } from 'antd';
import {
	SolutionOutlined,
	LikeOutlined,
	SoundOutlined,
} from '@ant-design/icons';
import Spinner from '../Spinner/Spinner';

const CompetitionJudgment = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(100);

	const {
		data: competitionList = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ['competitionList'],
		queryFn: async () => await CompetitionJudgementAPI.listAllJudgement(),
	});

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
			dataIndex: 'judgement',
			key: 'judgement',
		},
		{
			title: 'Level',
			dataIndex: 'level',
			key: 'level',
		},
		{
			title: 'AgeGroup',
			dataIndex: 'ageGroup',
			key: 'ageGroup',
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
						onClick={() => console.log('View', record)}
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
				</Space>
			),
		},
	];

	const dataTable = competitionList.map((item, index) => ({
		no: index + 1,
		timings: `${item.timing} - day ${item.competitionDay}`,
		judgement: `${item.participation.Athlete.firstName} ${item.participation.Athlete.lastName}`,
		level: item.level.name,
		ageGroup: item.participation.AthleteAge.age,
		totalScore: item.totalscore,
	}));

	if (isLoading) return <Spinner />;

	if (error) return <p>Error loading data: {error.message}</p>;

	return (
		<div>
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
		</div>
	);
};

export default CompetitionJudgment;
