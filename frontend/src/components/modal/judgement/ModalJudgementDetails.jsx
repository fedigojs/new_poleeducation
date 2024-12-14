import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import './ModalJudgementDetails.css';
import CustomTable from '../../Table/customTable';
import api from '../../../api/api';
import PropTypes from 'prop-types';

const ModalJudgementDetails = ({
    isOpen,
    onClose,
    competitionParticipationId,
}) => {
    const [dataTableList, setDataTableList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (competitionParticipationId && isOpen) {
            const fetchExerciseProtocolDetails = async () => {
                try {
                    setLoading(true);
                    const response = await api.get(
                        `/api/draw-judgement-result/participation/${competitionParticipationId}`
                    );

                    setDataTableList(response.data || []);
                } catch (error) {
                    console.error(
                        'Error fetching exercise protocol details:',
                        error
                    );
                    setDataTableList([]);
                } finally {
                    setLoading(false);
                }
            };

            fetchExerciseProtocolDetails();
        }
    }, [competitionParticipationId, isOpen]);

    const handleClose = () => {
        setDataTableList([]);
        onClose();
    };

    const columns = [
        {
            title: 'No',
            dataIndex: 'number',
            key: 'number',
        },
        {
            title: 'Element',
            dataIndex: 'element',
            key: 'element',
        },
        {
            title: 'Max Score',
            dataIndex: 'max_score',
            key: 'max_score',
        },
        {
            title: 'Score',
            dataIndex: 'score',
            key: 'score',
        },
        {
            title: 'Comment',
            dataIndex: 'comment',
            key: 'comment',
        },
    ];

    const groupedData = dataTableList.reduce((acc, item) => {
        const protocolTypeName = item.detail.protocolType.name;
        const judgeId = item.judgeId;

        if (!acc[protocolTypeName]) {
            acc[protocolTypeName] = {};
        }

        if (!acc[protocolTypeName][judgeId]) {
            acc[protocolTypeName][judgeId] = [];
        }

        acc[protocolTypeName][judgeId].push({
            key: item.id,
            number: acc[protocolTypeName][judgeId].length + 1,
            element: item.detail.elementName,
            score: item.score,
            max_score: item.detail.maxScore,
            comment: item.comment,
        });

        return acc;
    }, {});

    return (
        <Modal open={isOpen} onCancel={handleClose} footer={null} width={1200}>
            <h2>Judgement Details</h2>
            <b>Sportsman:</b>{' '}
            {dataTableList[0]?.participation?.Athlete?.firstName +
                dataTableList[0]?.participation?.Athlete?.lastName || ''}{' '}
            <br></br>
            <b>Age Category:</b>{' '}
            {dataTableList[0]?.participation?.AthleteAge?.age || ''}{' '}
            {Object.entries(groupedData).map(([protocolType, judges]) => (
                <div key={protocolType} style={{ marginBottom: '30px' }}>
                    <h3>{protocolType}</h3>
                    {Object.entries(judges).map(([judgeId, data]) => (
                        <div key={judgeId} style={{ marginBottom: '20px' }}>
                            <h4>Judge ID: {judgeId}</h4>
                            <CustomTable
                                dataSource={data}
                                columns={columns}
                                rowKey="key"
                                pagination={false}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </Modal>
    );
};

ModalJudgementDetails.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    competitionParticipationId: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
};

export default ModalJudgementDetails;
