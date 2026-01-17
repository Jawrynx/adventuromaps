/**
 * AlertModal.jsx - Modern alert/confirmation modal component
 * 
 * A sleek, customizable modal for displaying alerts, confirmations, and messages
 * to replace the default browser alert() function. Provides a modern UI consistent
 * with the application's design language.
 * 
 * Features:
 * - Success, error, warning, and info variants
 * - Customizable button text
 * - Keyboard support (Enter to confirm, Escape to close)
 * - Portal rendering for proper z-index layering
 * - Smooth animations
 * - Optional cancel button for confirmations
 */

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './css/AlertModal.css';

/**
 * AlertModal Component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {string} props.title - Modal title/heading
 * @param {string} props.message - Message content to display
 * @param {string} props.type - Alert type (success, error, warning, info)
 * @param {Function} props.onConfirm - Callback when OK/Confirm is clicked
 * @param {Function} props.onCancel - Callback when Cancel is clicked (optional)
 * @param {string} props.confirmText - Text for confirm button (default: "OK")
 * @param {string} props.cancelText - Text for cancel button (default: "Cancel")
 * @param {boolean} props.showCancel - Whether to show cancel button
 * @returns {JSX.Element|null} Portal rendered modal or null
 */
const AlertModal = ({
    isOpen,
    title,
    message,
    type = 'info',
    onConfirm,
    onCancel,
    confirmText = 'OK',
    cancelText = 'Cancel',
    showCancel = false
}) => {
    // Handle keyboard events
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                onConfirm?.();
            } else if (e.key === 'Escape') {
                if (showCancel && onCancel) {
                    onCancel();
                } else {
                    onConfirm?.();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onConfirm, onCancel, showCancel]);

    if (!isOpen) return null;

    // Icon based on type
    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
            default:
                return 'ℹ';
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            if (showCancel && onCancel) {
                onCancel();
            }
        }
    };

    return ReactDOM.createPortal(
        <div className="alert-modal-overlay" onClick={handleBackdropClick}>
            <div className={`alert-modal alert-modal-${type}`}>
                <div className={`alert-modal-icon alert-modal-icon-${type}`}>
                    {getIcon()}
                </div>
                
                {title && <h3 className="alert-modal-title">{title}</h3>}
                
                <div className="alert-modal-message">
                    {message}
                </div>
                
                <div className="alert-modal-actions">
                    {showCancel && (
                        <button
                            className="alert-modal-button alert-modal-button-cancel"
                            onClick={onCancel}
                            type="button"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        className={`alert-modal-button alert-modal-button-confirm alert-modal-button-${type}`}
                        onClick={onConfirm}
                        type="button"
                        autoFocus
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

AlertModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    showCancel: PropTypes.bool
};

export default AlertModal;
