import React from 'react';

const ModalDetails = ({ isOpen, onClose, children }) => {
	if (!isOpen) return null;

	return (
		<div className='modal-backdrop'>
			<div className='modal'>
				<button
					className='modal-close-button'
					onClick={onClose}>
					&times;
				</button>
				{children}
			</div>
		</div>
	);
};

export default ModalDetails;
