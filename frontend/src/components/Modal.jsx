import React from 'react';
import ReactDOM from 'react-dom';
import { Modal as BootstrapModal } from 'react-bootstrap';
import './Modal.css';

const Modal = ({ children, onClose, className, ...props }) => {
    const handleBackdropClick = (e) => {
        e.stopPropagation();
    };

    return ReactDOM.createPortal(
        <BootstrapModal
            show
            onHide={onClose}
            centered
            dialogClassName={`modal-fullscreen-sm-down ${className}`}
            {...props}
        >
            <BootstrapModal.Body
                onClick={handleBackdropClick}
                className="w-100 d-flex flex-column"
            >
                {children}
            </BootstrapModal.Body>
        </BootstrapModal>,
        document.getElementById('modal-root')
    );
};

export default Modal;
