import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import Modal from '../Modal';
import Spinner from '../Spinner/Spinner';
import { Form, Button, Col } from 'react-bootstrap';
import { Upload, message, Spin } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import api from '../../api/api';

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
    editingParticipation,
    initialValues,
    t,
}) => {
    const { Dragger } = Upload;
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
    const [fileList, setFileList] = useState([]);
    const [filteredExercises, setFilteredExercises] = useState([]);
    const [allExercises, setAllExercises] = useState([]);
    const [currentFiles, setCurrentFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        setAthleteId(initialValues.athleteId || '');
        setCompetitionId(initialValues.competitionId || '');
        setAthleteAgeId(initialValues.athleteAgeId || '');
        setAthleteTrendId(initialValues.athleteTrendId || '');
        setLevelId(initialValues.levelId || '');
        setSelectedExercises(initialValues.selectedExercises || []);
        setDisciplineId(initialValues.disciplineId || '');
        setCurrentFiles(initialValues.uploadedFiles || []);
    }, [initialValues]);

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
                console.error('Error loading exercises:', error);
                setError('Failed to load exercises.');
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

    if (!allExercises || allExercises.length === 0) {
        return (
            <Modal
                onClose={onClose}
                isVisible={isVisible}
                className="narrow-modal"
            >
                <div className="loading-container">
                    <Spin size="large" tip={t('label.loading')} />
                </div>
            </Modal>
        );
    }

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);

        const formData = new FormData();
        formData.append('athleteId', athleteId);
        formData.append('competitionId', competitionId);
        formData.append('athleteAgeId', athleteAgeId);
        formData.append('athleteTrendId', athleteTrendId);
        formData.append('levelId', levelId);
        formData.append('disciplineId', disciplineId);

        selectedExercises.forEach((exercise) => {
            if (exercise.value) {
                formData.append('exerciseIds[]', exercise.value);
            }
        });

        // Добавляем новые файлы
        fileList.forEach((file) => {
            if (file.originFileObj) {
                formData.append('files', file.originFileObj);
            } else {
                formData.append('files', file);
            }
        });

        // Добавляем текущие файлы (если не удалены)
        currentFiles.forEach((file) => {
            formData.append('currentFiles[]', file.id);
        });

        try {
            await onSubmit(formData);
            onClose();
        } catch (err) {
            console.error('Error during registration:', err);
            setError(
                err.response?.data.message ||
                    'There was an error during registration!'
            );
        } finally {
            setIsUploading(false);
        }
    };

    const handleExerciseChange = (selectedOptions) => {
        setSelectedExercises(selectedOptions || []);
    };

    const handleUploadChange = (info) => {
        let updatedFileList = [...info.fileList];

        updatedFileList = updatedFileList.slice(-5);

        // Update state
        setFileList(updatedFileList);

        // Display message based on status
        updatedFileList.forEach((file) => {
            if (file.status === 'done') {
                message.success(`${file.name} uploaded successfully.`);
            } else if (file.status === 'error') {
                message.error(`${file.name} upload failed.`);
            }
        });
    };

    const confirmFileRemove = (fileId) => {
        const confirmed = window.confirm(t('modal.confirmDeleteFile'));

        if (confirmed) {
            handleFileRemove(fileId);
        } else {
            console.log('Delete canceled');
        }
    };

    const handleFileRemove = async (fileId) => {
        try {
            // Запрос на удаление файла
            await api.delete(`/api/comp-part/files/${fileId}`);

            // Удалить файл из текущего состояния
            setCurrentFiles((prev) =>
                prev.filter((file) => file.id !== fileId)
            );

            message.success('File deleted successfully');
        } catch (error) {
            console.error('Error deleting file:', error);
            message.error('Failed to delete file');
        }
    };

    const customUpload = ({ file, onSuccess, onError, onProgress }) => {
        const reader = new FileReader();

        reader.onload = () => {
            // Simulate server-side upload delay
            setTimeout(() => {
                onSuccess('ok');
            }, 1000);
        };

        reader.onerror = (err) => {
            onError(err);
        };

        reader.onprogress = (event) => {
            if (event.loaded && event.total) {
                const percent = Math.round((event.loaded / event.total) * 100);
                onProgress({ percent }, file);
            }
        };

        reader.readAsDataURL(file);
    };

    const props = {
        fileList,
        onChange: handleUploadChange,
        customRequest: customUpload,
        beforeUpload: (file) => {
            const allowedExtensions = ['mp3', 'mp4', 'jpeg', 'png'];
            const fileExtension = file.name.split('.').pop().toLowerCase();

            if (!allowedExtensions.includes(fileExtension)) {
                message.error(`${file.name} is not a supported file format.`);
                return Upload.LIST_IGNORE;
            }
            return true;
        },

        showUploadList: {
            showRemoveIcon: true,
        },
    };

    return (
        <Modal onClose={onClose} isVisible={isVisible} className="narrow-modal">
            {isUploading ? (
                <>
                    <Spinner />
                </>
            ) : (
                <Form onSubmit={handleRegisterSubmit}>
                    <Button
                        variant="secondary"
                        className="modal-close-button"
                        onClick={onClose}
                    >
                        &times;
                    </Button>
                    <h3 className="text-center mb-4">
                        {editingParticipation
                            ? t('h3.editParticipant')
                            : t('h3.registrationParticipant')}
                    </h3>

                    <Form.Group as={Col} controlId="athlete">
                        <Form.Label>{t('label.addParticipant')}</Form.Label>
                        <Form.Control
                            as="select"
                            value={athleteId}
                            onChange={(e) => setAthleteId(e.target.value)}
                            required
                        >
                            <option value="">
                                {t('option.selectParticipant')}
                            </option>
                            {athletes
                                .sort((a, b) =>
                                    a.lastName.localeCompare(b.lastName)
                                )
                                .map((athlete) => (
                                    <option key={athlete.id} value={athlete.id}>
                                        {athlete.lastName} {athlete.firstName}
                                    </option>
                                ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group as={Col} controlId="competition">
                        <Form.Label>{t('label.competition')}</Form.Label>
                        <Form.Control
                            as="select"
                            value={competitionId}
                            onChange={(e) => setCompetitionId(e.target.value)}
                            required
                        >
                            <option value="">
                                {t('option.selectCompetition')}
                            </option>
                            {competitions
                                .filter(
                                    (competition) =>
                                        editingParticipation ||
                                        competition.display !== false
                                )
                                .map((competition) => (
                                    <option
                                        key={competition.id}
                                        value={competition.id}
                                    >
                                        {competition.title}
                                    </option>
                                ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group as={Col} controlId="trends">
                        <Form.Label>{t('label.direction')}</Form.Label>
                        <Form.Control
                            as="select"
                            value={athleteTrendId}
                            onChange={(e) => setAthleteTrendId(e.target.value)}
                            required
                        >
                            <option value="">
                                {t('option.selectDirection')}
                            </option>
                            {athleteTrend.map((trend) => (
                                <option key={trend.id} value={trend.id}>
                                    {trend.trends}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group as={Col} controlId="ages">
                        <Form.Label>{t('label.age')}</Form.Label>
                        <Form.Control
                            as="select"
                            value={athleteAgeId}
                            onChange={(e) => setAthleteAgeId(e.target.value)}
                            required
                        >
                            <option value="">{t('option.selectAge')}</option>
                            {athleteAge.map((age) => (
                                <option key={age.id} value={age.id}>
                                    {age.age}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group as={Col} controlId="level">
                        <Form.Label>{t('label.mastery')}</Form.Label>
                        <Form.Control
                            as="select"
                            value={levelId}
                            onChange={(e) => setLevelId(e.target.value)}
                            required
                        >
                            <option value="">
                                {t('option.selectMastery')}
                            </option>
                            {levels.map((level) => (
                                <option key={level.id} value={level.id}>
                                    {level.name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group as={Col} controlId="discipline">
                        <Form.Label>{t('label.discipline')}</Form.Label>
                        <Form.Control
                            as="select"
                            value={disciplineId}
                            onChange={(e) => setDisciplineId(e.target.value)}
                            required
                        >
                            <option value="">
                                {t('option.selectDiscipline')}
                            </option>
                            {disciplines.map((discipline) => (
                                <option
                                    key={discipline.id}
                                    value={discipline.id}
                                >
                                    {discipline.name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group as={Col} controlId="exercise">
                        <Form.Label>{t('label.exercise')}</Form.Label>
                        <Select
                            id="exercise"
                            isMulti
                            options={filteredExercises}
                            value={selectedExercises}
                            onChange={handleExerciseChange}
                            className="basic-multi-select"
                            classNamePrefix="select"
                        />
                    </Form.Group>

                    {/* Отображение текущих файлов */}
                    {editingParticipation && currentFiles.length > 0 && (
                        <div>
                            <h5>{t('label.currentFiles')}</h5>
                            <ul className="file-list">
                                {currentFiles.map((file, index) => (
                                    <li
                                        key={file.id || file.filePath || index}
                                        className="file-list-item"
                                    >
                                        <a
                                            href={file.filePath}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="file-link"
                                        >
                                            {file.fileName ||
                                                t('label.unknownFile')}
                                        </a>
                                        <Button
                                            variant="danger"
                                            onClick={() =>
                                                confirmFileRemove(file.id)
                                            }
                                            className="remove-file-button"
                                        >
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Загрузка новых файлов */}
                    <Form.Group as={Col} controlId="fileUpload">
                        <Form.Label>{t('label.uploadFiles')}</Form.Label>
                        <Dragger {...props}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">
                                {t('label.dragOrClickToUpload')}
                            </p>
                            <p className="ant-upload-hint">
                                {t('label.supportedFormats')}: mp3, mp4, jpg,
                                png
                            </p>
                        </Dragger>
                    </Form.Group>

                    <div className="form-actions d-flex justify-content-between">
                        <Button className="m-4" type="submit" variant="primary">
                            {editingParticipation
                                ? t('button.edit')
                                : t('button.registrationVerb')}
                        </Button>
                        <Button
                            className="m-4"
                            variant="secondary"
                            onClick={onClose}
                        >
                            {t('button.cancel')}
                        </Button>
                    </div>

                    {error && <p className="text-danger mt-2">{error}</p>}
                </Form>
            )}
        </Modal>
    );
};
AthleteRegistrationModal.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    athletes: PropTypes.array.isRequired,
    competitions: PropTypes.array.isRequired,
    athleteTrend: PropTypes.array.isRequired,
    athleteAge: PropTypes.array.isRequired,
    levels: PropTypes.array.isRequired,
    disciplines: PropTypes.array.isRequired,
    editingParticipation: PropTypes.bool.isRequired,
    initialValues: PropTypes.shape({
        athleteId: PropTypes.string,
        competitionId: PropTypes.string,
        athleteAgeId: PropTypes.string,
        athleteTrendId: PropTypes.string,
        levelId: PropTypes.string,
        selectedExercises: PropTypes.array,
        disciplineId: PropTypes.string,
        uploadedFiles: PropTypes.array,
    }).isRequired,
    t: PropTypes.func.isRequired,
};

export default AthleteRegistrationModal;
