import React, { useState, useEffect } from 'react';
import { Modal, Button, Space } from 'antd';
import api from '../../../api/api';
import ModalJudgementProtocol from './ModalJudgementProtocol';
import ModalJudgementExercise from './ModalJudgementExercise';
import PropTypes from 'prop-types';

const ModalJudgement = ({ isOpen, onClose, participant, judgeId }) => {
    const [protocols, setProtocols] = useState([]);
    const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
    const [selectedProtocol, setSelectedProtocol] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [shouldUpdate, setShouldUpdate] = useState(false);
    const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
    const [selectedExerciseProtocol, setSelectedExerciseProtocol] =
        useState(null);
    const [exerciseErrorMessage, setExerciseErrorMessage] = useState('');

    useEffect(() => {
        if (isOpen && participant?.participation?.AthleteTrend) {
            loadProtocols();
        }
    }, [isOpen, participant]);

    const loadProtocols = async () => {
        if (participant?.participation?.AthleteTrend) {
            const trendId = participant.participation.AthleteTrend;
            try {
                const response = await api.get(
                    `/api/athletes-trend/protocols/${trendId}`
                );
                const updatedProtocols = await Promise.all(
                    response.data.protocolTrends.map(async (protocol) => {
                        const isFilled = await checkIfProtocolIsFilled(
                            protocol.protocolType.id,
                            participant.participation.athleteId,
                            participant.competitionParticipationId,
                            judgeId
                        );
                        const filledByCurrentJudge =
                            await checkIfFilledByCurrentJudge(
                                protocol.protocolType.id,
                                participant.participation.athleteId,
                                participant.competitionParticipationId,
                                judgeId
                            );
                        return {
                            ...protocol,
                            isFilled,
                            filledByCurrentJudge,
                        };
                    })
                );
                setProtocols(updatedProtocols);
                setShouldUpdate(!shouldUpdate);
            } catch (error) {
                console.error('Error fetching protocols:', error);
                setProtocols([]);
            }
        }
    };
    const checkIfProtocolIsFilled = async (
        protocolTypeId,
        athleteId,
        competitionParticipationId
    ) => {
        try {
            const response = await api.get(
                `/api/protocol-result/athlete/${athleteId}/participation/${competitionParticipationId}/type/${protocolTypeId}`
            );
            return response.data && response.data.length > 0;
        } catch (error) {
            return false;
        }
    };

    const checkIfFilledByCurrentJudge = async (
        protocolTypeId,
        athleteId,
        competitionParticipationId,
        judgeId
    ) => {
        try {
            const response = await api.get(
                `/api/protocol-result/athlete/${athleteId}/participation/${competitionParticipationId}/type/${protocolTypeId}/judge/${judgeId}`
            );
            return response.data && response.data.length > 0;
        } catch (error) {
            return false;
        }
    };

    const openProtocolModal = async (protocolTypeId) => {
        try {
            const response = await api.get(
                `/api/protocol-details/${protocolTypeId}`
            );
            if (response.data) {
                setSelectedProtocol(response.data);
                setIsProtocolModalOpen(true);
                setErrorMessage('');
            } else {
                setErrorMessage(
                    `Протокол с таким protocolTypeId ${protocolTypeId} не найден.`
                );
                setIsProtocolModalOpen(true);
            }
        } catch (error) {
            console.error('Error fetching protocol data:', error);
            setErrorMessage('Ошибка получения данных протокола.');
            setIsProtocolModalOpen(true);
        }
    };

    const openExerciseModal = async (competitionParticipationId) => {
        try {
            const response = await api.get(
                `/api/comp-part/${competitionParticipationId}`
            );
            if (response.data) {
                setSelectedExerciseProtocol(response.data);
                setIsExerciseModalOpen(true);
                setExerciseErrorMessage('');
            } else {
                setExerciseErrorMessage(
                    `Данные с таким competitionParticipationId ${competitionParticipationId} не найдены.`
                );
                setIsExerciseModalOpen(true);
            }
        } catch (error) {
            console.error('Error fetching exercise data:', error);
            setExerciseErrorMessage('Ошибка получения данных упражнения.');
            setIsExerciseModalOpen(true);
        }
    };

    const closeProtocolModal = () => {
        setIsProtocolModalOpen(false);
        setSelectedProtocol(null);
        setErrorMessage('');
    };

    const closeExerciseModal = () => {
        setIsExerciseModalOpen(false);
        setSelectedExerciseProtocol(null);
        setExerciseErrorMessage('');
    };

    return (
        <>
            <Modal
                title={`Голосование за ${participant?.participation?.Athlete?.firstName} ${participant?.participation?.Athlete?.lastName}`}
                open={isOpen}
                onCancel={onClose}
                footer={[
                    <Button key="close" onClick={onClose}>
                        Закрыть
                    </Button>,
                ]}
                width={800}
            >
                <div className="button-container">
                    {protocols.map((protocol) => (
                        <Button
                            key={protocol.id}
                            type={
                                protocol.isFilled
                                    ? protocol.filledByCurrentJudge
                                        ? 'primary'
                                        : 'default'
                                    : 'dashed'
                            }
                            onClick={() => {
                                if (
                                    !protocol.isFilled ||
                                    protocol.filledByCurrentJudge ||
                                    protocol.protocolType.id === 6
                                ) {
                                    if (protocol.protocolType.id === 7) {
                                        openExerciseModal(
                                            participant.competitionParticipationId
                                        );
                                    } else {
                                        openProtocolModal(
                                            protocol.protocolType.id
                                        );
                                    }
                                }
                            }}
                            disabled={
                                protocol.isFilled &&
                                !protocol.filledByCurrentJudge &&
                                protocol.protocolType.id !== 6
                            }
                        >
                            {protocol.protocolType.name}
                        </Button>
                    ))}
                </div>
            </Modal>

            <ModalJudgementProtocol
                isOpen={isProtocolModalOpen}
                onClose={closeProtocolModal}
                protocol={selectedProtocol}
                errorMessage={errorMessage}
                athleteId={participant?.participation?.athleteId}
                competitionId={participant?.participation?.competitionId}
                protocolId={selectedProtocol?.id}
                competitionParticipationId={
                    participant?.competitionParticipationId
                }
                protocolTypeId={selectedProtocol?.protocolTypeId}
            />

            <Modal
                title="Детали Упражнения"
                open={isExerciseModalOpen}
                onCancel={closeExerciseModal}
                footer={[
                    <Button key="close" onClick={closeExerciseModal}>
                        Закрыть
                    </Button>,
                ]}
            >
                <ModalJudgementExercise
                    isOpen={isExerciseModalOpen}
                    onClose={closeExerciseModal}
                    protocol={selectedExerciseProtocol}
                    errorMessage={exerciseErrorMessage}
                    competitionParticipationId={
                        participant?.competitionParticipationId
                    }
                />
            </Modal>
        </>
    );
};

ModalJudgement.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    participant: PropTypes.shape({
        participation: PropTypes.shape({
            AthleteTrend: PropTypes.shape({
                id: PropTypes.number.isRequired,
            }),
            athleteId: PropTypes.number.isRequired,
            competitionId: PropTypes.number.isRequired,
            Athlete: PropTypes.shape({
                firstName: PropTypes.string,
                lastName: PropTypes.string,
            }),
        }),
        competitionParticipationId: PropTypes.number.isRequired,
    }),
    judgeId: PropTypes.number.isRequired,
};

export default ModalJudgement;
