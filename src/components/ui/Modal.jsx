import React from 'react';
import './css/Modal.css';

const Modal = ({ children, onClose }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
      <div className="modal-content" id='modal'>
        <button className="modal-close" onClick={onClose}>&times;</button>
        {children}
      </div>
  );
};

export default Modal;