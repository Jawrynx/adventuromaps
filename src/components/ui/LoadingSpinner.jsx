import React from 'react'

/**
 * LoadingSpinner Component
 * 
 * Reusable loading indicator with animated spinning circle and loading text.
 * Provides visual feedback during async operations like data fetching,
 * form submissions, or page transitions.
 * 
 * Features:
 * - CSS animated spinning circle
 * - Centered layout with customizable loading text
 * - Inline styling for portability
 * - Consistent loading experience across the app
 * 
 * @param {string} text - Optional custom text to display (defaults to "Loading...")
 * @returns {JSX.Element} Animated loading spinner with text
 */
function LoadingSpinner({ text = "Loading..." }) {
  return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            {/* Animated spinning circle */}
            <div style={{
                border: '10px solid #f3f3f3',
                borderTop: '10px solid #3498db',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
            }}></div>
            
            {/* CSS keyframe animation for spinning effect */}
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
            
            <p style={{ marginTop: '10px' }}>{text}</p>
        </div>
    );
}

export default LoadingSpinner