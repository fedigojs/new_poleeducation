import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Table } from 'react-bootstrap';

const ExerciseDetailsModal = ({
	isVisible,
	onClose,
	selectedParticipationDetails,
	t,
}) => {
	return (
		<Modal
			show={isVisible}
			onHide={onClose}
			size='xl'
			centered>
			<Modal.Header closeButton>
				<Modal.Title>{t('h3.exerciseDetails')}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<h2>{t('table.athlete')}:</h2>
				<Table
					striped
					bordered
					hover
					className='details-table'>
					<thead>
						<tr>
							<th>{t('table.exercise')}</th>
							<th>{t('table.descriptions')}</th>
							<th>{t('table.image')}</th>
						</tr>
					</thead>
					<tbody>
						{selectedParticipationDetails.map((detail, index) => (
							<tr key={index}>
								<td>{detail.exercise.name}</td>
								<td>{detail.exercise.descriptions}</td>
								<td>
									<img
										src={detail.exercise.image}
										alt={detail.exercise.name}
										className='exercise-image'
										style={{ width: '100px' }}
									/>
								</td>
							</tr>
						))}
					</tbody>
				</Table>
			</Modal.Body>
			<Modal.Footer>
				<Button
					variant='secondary'
					onClick={onClose}>
					{t('button.close')}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
ExerciseDetailsModal.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	selectedParticipationDetails: PropTypes.arrayOf(
		PropTypes.shape({
			exercise: PropTypes.shape({
				name: PropTypes.string.isRequired,
				descriptions: PropTypes.string.isRequired,
				image: PropTypes.string.isRequired,
			}).isRequired,
		})
	).isRequired,
	t: PropTypes.func.isRequired,
};

export default ExerciseDetailsModal;
