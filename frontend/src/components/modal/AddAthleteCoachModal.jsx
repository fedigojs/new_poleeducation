import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const AddAthleteCoachModal = ({ isVisible, onClose, onSubmit, coaches }) => {
    const { t } = useTranslation();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');

    const handleAddAthlete = async (e) => {
        e.preventDefault();
        try {
            await onSubmit({ firstName, lastName, coachId: coaches.id });
            setFirstName('');
            setLastName('');
            onClose();
        } catch (err) {
            setError(err.response?.data.message || 'An error has occurred');
        }
    };

    return (
        <Modal show={isVisible} onHide={onClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>{t('modal.title.addAthlete')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleAddAthlete}>
                    <Form.Group controlId="firstName">
                        <Form.Label>{t('label.firstName')}</Form.Label>
                        <Form.Control
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="lastName">
                        <Form.Label>{t('label.lastName')}</Form.Label>
                        <Form.Control
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="coachId">
                        <Form.Label>{t('label.coach')}</Form.Label>
                        <Form.Control as="select" value={coaches.id} disabled>
                            <option value={coaches.id}>
                                {coaches.firstName} {coaches.lastName}
                            </option>
                        </Form.Control>
                    </Form.Group>

                    {error && <p className="text-danger">{error}</p>}

                    <div className="d-flex justify-content-end">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="m-3"
                        >
                            {t('button.cancel')}
                        </Button>
                        <Button type="submit" variant="primary" className="m-3">
                            {t('button.add')}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};
AddAthleteCoachModal.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    coaches: PropTypes.shape({
        id: PropTypes.string.isRequired,
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
    }).isRequired,
};

export default AddAthleteCoachModal;
