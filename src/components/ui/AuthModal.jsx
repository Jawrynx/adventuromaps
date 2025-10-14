/**
 * AuthModal.jsx - Dedicated modal component for authentication
 * 
 * Custom modal specifically designed for the authentication interface.
 * Provides proper backdrop, centering, and close functionality
 * optimized for login/register forms.
 */

import React, { useEffect } from 'react';
import './css/AuthModal.css';

/**
 * AuthModal Component
 * 
 * Dedicated modal overlay for authentication forms. Provides backdrop,
 * centering, and escape key handling specifically designed for auth UI.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Modal content to display
 * @param {Function} props.onClose - Callback when modal should close
 * @returns {JSX.Element} Authentication modal overlay
 */
function AuthModal({ children, onClose }) {
    /**
     * Handle escape key press to close modal
     */
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        
        // Prevent body scrolling when modal is open
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    /**
     * Handle backdrop click to close modal
     * 
     * @param {Event} e - Click event
     */
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="auth-modal-overlay" onClick={handleBackdropClick}>
            <div className="auth-modal-content">
                {children}
            </div>
        </div>
    );
}

export default AuthModal;