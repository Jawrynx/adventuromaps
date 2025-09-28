import React, { useEffect } from 'react';
import './css/Modal.css';

/**
 * Modal Component
 * 
 * Reusable modal overlay component that displays content above the main
 * application interface. Handles backdrop clicks, scroll prevention,
 * accessibility features, and Electron window focus management.
 * 
 * Features:
 * - Overlay with backdrop click to close
 * - Body scroll prevention when open
 * - Electron window focus simulation
 * - Accessibility attributes (ARIA)
 * - Optional close button
 * - Conditional rendering based on isOpen prop
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Modal content to display
 * @param {Function} props.onClose - Callback when modal should close
 * @param {boolean} props.isOpen - Whether modal is visible (default: true)
 * @returns {JSX.Element|null} Modal overlay or null if closed
 */
const Modal = ({ children, onClose, isOpen = true }) => {
  /**
   * Handle modal open/close side effects
   * 
   * Prevents body scrolling when modal is open and handles Electron
   * window focus for proper input handling in desktop app.
   */
  useEffect(() => {
    if (isOpen) {
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
      
      // Electron-specific: Simulate window refocus for input handling
      if (window.electron?.simulateWindowRefocus) {
        setTimeout(() => {
          window.electron.simulateWindowRefocus();
        }, 100);
      }

      return () => {
        // Restore scrolling when modal closes
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
        {/* Optional close button */}
        {onClose && (
          <button className="modal-close" onClick={onClose}>&times;</button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;