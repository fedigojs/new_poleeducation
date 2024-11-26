import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, ListGroup } from 'react-bootstrap';

const UploadedFilesModal = ({ isVisible, onClose, files, t }) => {
	return (
		<Modal
			show={isVisible}
			onHide={onClose}
			size='lg'
			centered>
			<Modal.Header closeButton>
				<Modal.Title>{t('title.addedFiles')}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{files.length > 0 ? (
					<ListGroup>
						{files.map((file, index) => (
							<ListGroup.Item key={index}>
								<a
									href={file.filePath}
									target='_blank'
									rel='noopener noreferrer'>
									{file.fileName}
								</a>
							</ListGroup.Item>
						))}
					</ListGroup>
				) : (
					<p>{t('p.filesIsNotAdded')}</p>
				)}
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
UploadedFilesModal.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	files: PropTypes.array.isRequired,
	t: PropTypes.func.isRequired,
};

export default UploadedFilesModal;
