import React, { useEffect } from 'react';
import './css/Modal.css';

const Modal = ({ children, onClose, isOpen = true }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      if (window.electron?.simulateWindowRefocus) {
        setTimeout(() => {
          window.electron.simulateWindowRefocus();
        }, 100);
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div 
        className="modal-content" 
        id='modal'
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        {onClose && (
          <button className="modal-close" onClick={onClose}>&times;</button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;