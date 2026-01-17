/**
 * useAlert.js - Custom hook for using AlertModal throughout the app
 * 
 * This hook provides a simple API for showing alerts without managing state
 * in every component. It returns an alert function and the AlertModal component
 * to render.
 * 
 * Usage:
 * ```jsx
 * const { showAlert, AlertComponent } = useAlert();
 * 
 * // In your JSX
 * return (
 *   <>
 *     {AlertComponent}
 *     <button onClick={() => showAlert('Success!', 'Operation completed', 'success')}>
 *       Do Something
 *     </button>
 *   </>
 * );
 * ```
 */

import React, { useState } from 'react';
import AlertModal from '../components/ui/AlertModal';

const useAlert = () => {
    const [alertState, setAlertState] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        confirmText: 'OK',
        cancelText: 'Cancel',
        showCancel: false,
        onConfirm: null,
        onCancel: null
    });

    /**
     * Show an alert modal
     * 
     * @param {string} message - The message to display
     * @param {string} title - Optional title for the alert
     * @param {string} type - Alert type: 'success', 'error', 'warning', 'info'
     * @param {Object} options - Additional options
     * @param {string} options.confirmText - Custom text for confirm button
     * @param {string} options.cancelText - Custom text for cancel button
     * @param {boolean} options.showCancel - Whether to show cancel button
     * @param {Function} options.onConfirm - Custom confirm callback
     * @param {Function} options.onCancel - Custom cancel callback
     */
    const showAlert = (
        message, 
        title = '', 
        type = 'info', 
        options = {}
    ) => {
        return new Promise((resolve) => {
            setAlertState({
                isOpen: true,
                title,
                message,
                type,
                confirmText: options.confirmText || 'OK',
                cancelText: options.cancelText || 'Cancel',
                showCancel: options.showCancel || false,
                onConfirm: () => {
                    setAlertState(prev => ({ ...prev, isOpen: false }));
                    if (options.onConfirm) options.onConfirm();
                    resolve(true);
                },
                onCancel: () => {
                    setAlertState(prev => ({ ...prev, isOpen: false }));
                    if (options.onCancel) options.onCancel();
                    resolve(false);
                }
            });
        });
    };

    const AlertComponent = React.createElement(AlertModal, {
        isOpen: alertState.isOpen,
        title: alertState.title,
        message: alertState.message,
        type: alertState.type,
        confirmText: alertState.confirmText,
        cancelText: alertState.cancelText,
        showCancel: alertState.showCancel,
        onConfirm: alertState.onConfirm,
        onCancel: alertState.onCancel
    });

    return { showAlert, AlertComponent };
};

export default useAlert;
