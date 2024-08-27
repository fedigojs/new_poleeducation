import React from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

const Modal = ({ children, onClose, className }) => {
	const handleBackdropClick = (e) => {
		e.stopPropagation(); // Предотвращаем всплытие, чтобы не закрыть окно при клике внутри
	};

	return ReactDOM.createPortal(
		<div
			className='modal-backdrop'
			onClick={onClose}>
			<div
				className={`modal ${className}`}
				onClick={handleBackdropClick}>
				{children}
			</div>
		</div>,
		document.getElementById('modal-root')
	);
};

export default Modal;
