import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, ListGroup } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import api from '../../api/api';

const UploadedFilesModal = ({
    isVisible,
    onClose,
    t,
    editingParticipation,
}) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isVisible && editingParticipation) {
            api.get(`/api/comp-part/${editingParticipation.id}`)
                .then((response) => {
                    const filesWithFullPath = response.data.uploadedFiles.map(
                        (file) => ({
                            ...file,
                            filePath: `${import.meta.env.VITE_API_URL}${file.filePath}`,
                        })
                    );
                    setFiles(filesWithFullPath);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching files:', error);
                    setLoading(false);
                });
        }
    }, [isVisible, editingParticipation]);

    return (
        <Modal show={isVisible} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>{t('title.addedFiles')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <p>{t('p.loading')}</p>
                ) : files.length > 0 ? (
                    <ListGroup>
                        {files.map((file, index) => {
                            const extension = file.filePath
                                .split('.')
                                .pop()
                                .toLowerCase();
                            return (
                                <ListGroup.Item key={index}>
                                    {['png', 'jpeg', 'jpg'].includes(
                                        extension
                                    ) && (
                                        <img
                                            src={file.filePath}
                                            alt={file.fileName}
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '200px',
                                            }}
                                        />
                                    )}
                                    {extension === 'mp3' && (
                                        <audio controls>
                                            <source
                                                src={file.filePath}
                                                type="audio/mpeg"
                                            />
                                            {t('p.audioNotSupported')}
                                        </audio>
                                    )}
                                    {!['png', 'jpeg', 'jpg', 'mp3'].includes(
                                        extension
                                    ) && (
                                        <a
                                            href={file.filePath}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {file.fileName}
                                        </a>
                                    )}
                                </ListGroup.Item>
                            );
                        })}
                    </ListGroup>
                ) : (
                    <p>{t('p.filesIsNotAdded')}</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    {t('button.close')}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

UploadedFilesModal.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    files: PropTypes.array.isRequired,
    t: PropTypes.func.isRequired,
    editingParticipation: PropTypes.object.isRequired,
};

export default UploadedFilesModal;
