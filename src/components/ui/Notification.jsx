/**
 * Notification.jsx - Reusable notification/toast component
 * 
 * A versatile notification component that displays temporary messages to users.
 * Can be used for success messages, errors, warnings, and general information.
 * 
 * Features:
 * - Multiple notification types (success, error, warning, info)
 * - Auto-dismiss functionality with customizable duration
 * - Manual dismiss capability
 * - Consistent styling with app theme
 * - Smooth animations
 * - Portal rendering for proper z-index layering
 */

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import './css/Notification.css';

/**
 * Notification Component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isVisible - Whether notification is visible
 * @param {string} props.message - Message to display
 * @param {string} props.type - Type of notification (success, error, warning, info)
 * @param {Function} props.onClose - Callback when notification is closed
 * @param {number} props.duration - Auto-dismiss duration in ms (0 for no auto-dismiss)
 * @param {string} props.position - Position on screen (top-right, top-center, bottom-right, bottom-center)
 * @returns {JSX.Element|null} Portal rendered notification or null
 */
const Notification = ({
    isVisible,
    message,
    type = 'info',
    onClose,
    duration = 3000,
    position = 'top-right'
}) => {
    const [shouldRender, setShouldRender] = useState(isVisible);

    useEffect(() => {
        if (isVisible) {
            setShouldRender(true);
            
            // Auto-dismiss if duration is set
            if (duration > 0) {
                const timer = setTimeout(() => {
                    handleClose();
                }, duration);
                
                return () => clearTimeout(timer);
            }
        } else {
            // Delay unmounting to allow fade-out animation
            const timer = setTimeout(() => {
                setShouldRender(false);
            }, 300);
            
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration]);

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    if (!shouldRender) {
        return null;
    }

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

    return ReactDOM.createPortal(
        <div 
            className={`notification notification-${type} notification-${position} ${isVisible ? 'visible' : 'hidden'}`}
        >
            <div className="notification-icon">
                {getIcon()}
            </div>
            <div className="notification-message">
                {message}
            </div>
            <button 
                className="notification-close"
                onClick={handleClose}
                aria-label="Close notification"
            >
                ×
            </button>
        </div>,
        document.body
    );
};

export default Notification;
