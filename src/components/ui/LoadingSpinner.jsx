import React from 'react'

function LoadingSpinner() {
  return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                border: '10px solid #f3f3f3',
                borderTop: '10px solid #3498db',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
            }}></div>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
            <p style={{ marginTop: '10px' }}>Loading...</p>
        </div>
    );
}

export default LoadingSpinner