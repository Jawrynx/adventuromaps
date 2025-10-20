import React, { useEffect, useState, useRef, useCallback } from 'react';
import './css/Modal.css';

/**
 * Modal Component
 * 
 * Reusable modal overlay component that displays content above the main
 * application interface. Handles backdrop clicks, scroll prevention,
 * accessibility features, and draggable functionality.
 * 
 * Features:
 * - Overlay with backdrop click to close
 * - Body scroll prevention when open
 * - Draggable by header area
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
const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

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




  useEffect(() => {
    if (isOpen) {
      setPosition({ 
        x: Math.max(0, window.innerWidth - 410), 
        y: 60 
      });
    }
  }, [isOpen]);

  /**
   * Handle mouse down anywhere on modal to start dragging
   */
  const handleDragStart = (e) => {
    // Don't start dragging if clicking on interactive elements including list items
    if (e.target.tagName === 'BUTTON' || 
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.tagName === 'SELECT' ||
        e.target.tagName === 'A' ||
        e.target.tagName === 'LI' ||
        e.target.classList.contains('modal-close') ||
        e.target.closest('button') ||
        e.target.closest('input') ||
        e.target.closest('textarea') ||
        e.target.closest('select') ||
        e.target.closest('a') ||
        e.target.closest('li')) {
      return;
    }
    
    // Prevent text selection during drag
    e.preventDefault();
    
    setIsDragging(true);
    const rect = modalRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  /**
   * Handle mouse move during dragging
   */
  const handleDragMove = useCallback((e) => {
    if (!isDragging) return;
    
    // Calculate new position with viewport constraints
    let newX = e.clientX - dragOffset.x;
    let newY = e.clientY - dragOffset.y;
    
    // Prevent dragging outside viewport bounds
    const modalWidth = modalRef.current ? modalRef.current.offsetWidth : 400;
    const modalHeight = modalRef.current ? modalRef.current.offsetHeight : 500;
    
    newX = Math.max(0, Math.min(newX, window.innerWidth - modalWidth));
    newY = Math.max(0, Math.min(newY, window.innerHeight - modalHeight));
    
    setPosition({ x: newX, y: newY });
  }, [isDragging, dragOffset.x, dragOffset.y]);

  /**
   * Handle mouse up to stop dragging
   */
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Add global mouse event listeners for dragging
   */
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div 
        ref={modalRef}
        className={`modal-content draggable-modal ${isDragging ? 'dragging' : ''}`}
        id='modal'
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        style={{
          left: position.x,
          top: position.y,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleDragStart}
      >
        {/* Optional close button */}
        {onClose && (
          <button 
            className="modal-close" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            type="button"
            aria-label="Close modal"
          >
            &times;
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;