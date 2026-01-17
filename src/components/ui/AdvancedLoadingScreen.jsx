/**
 * AdvancedLoadingScreen.jsx - Advanced animated loading screen component
 * 
 * A sophisticated loading screen with multiple spinning rings, center pulse,
 * and loading dots. Converted from React Native to web React.
 */

import React, { useEffect, useState } from 'react';

const AdvancedLoadingScreen = ({ 
    text = "Loading...", 
    fullScreen = false, 
    backgroundColor = 'transparent',
    style = {} 
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger fade in animation
        const timer = setTimeout(() => setIsVisible(true), 50);
        return () => clearTimeout(timer);
    }, []);

    const containerStyle = fullScreen 
        ? {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            ...containerStyles.container
        }
        : {
            ...containerStyles.container
        };

    return (
        <div style={{ ...containerStyle, background: backgroundColor, ...style }}>
            {/* Geometric Grid Background */}
            <div style={containerStyles.geometricGrid}>
                <div style={containerStyles.gridPattern}></div>
            </div>
            
            <div style={{
                ...containerStyles.centerContainer,
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.5s ease'
            }}>
                <div style={containerStyles.loadingRingsContainer}>
                    {/* Outer ring */}
                    <div style={{...containerStyles.loadingRing, ...containerStyles.outerRing}} />
                    
                    {/* Middle ring */}
                    <div style={{...containerStyles.loadingRing, ...containerStyles.middleRing}} />
                    
                    {/* Inner ring */}
                    <div style={{...containerStyles.loadingRing, ...containerStyles.innerRing}} />
                    
                    {/* Center pulse */}
                    <div style={containerStyles.centerPulse} />
                </div>
                
                <div style={containerStyles.loadingText}>{text}</div>
                
                <div style={containerStyles.loadingDotsContainer}>
                    <div style={{...containerStyles.loadingDot, animationDelay: '0s'}} />
                    <div style={{...containerStyles.loadingDot, animationDelay: '0.2s'}} />
                    <div style={{...containerStyles.loadingDot, animationDelay: '0.4s'}} />
                </div>
            </div>

            <style jsx>{`
                @keyframes spin1 {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @keyframes spin2 {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                
                @keyframes spin3 {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
                
                @keyframes dotPulse {
                    0%, 80%, 100% { opacity: 0.3; }
                    40% { opacity: 1; }
                }
                
                @keyframes gridMove {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(20px, 20px); }
                }
            `}</style>
        </div>
    );
};

const containerStyles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100%',
        width: '100%',
        position: 'relative',
        overflow: 'hidden'
    },
    geometricGrid: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        zIndex: 1
    },
    gridPattern: {
        width: '120%',
        height: '120%',
        backgroundImage: `
            linear-gradient(90deg, rgba(255, 251, 0, 0.2) 1px, transparent 1px),
            linear-gradient(rgba(0, 122, 255, 0.2) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        animation: 'gridMove 10s linear infinite'
    },
    centerContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        position: 'relative',
    },
    loadingRingsContainer: {
        width: '180px',
        height: '180px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginBottom: '40px'
    },
    loadingRing: {
        position: 'absolute',
        borderRadius: '50%',
        border: '3px solid transparent'
    },
    outerRing: {
        width: '180px',
        height: '180px',
        borderTopColor: '#fffb00',
        borderRightColor: '#fffb00',
        opacity: 0.6,
        animation: 'spin1 3s linear infinite'
    },
    middleRing: {
        width: '130px',
        height: '130px',
        borderTopColor: '#007AFF',
        borderLeftColor: '#007AFF',
        borderBottomColor: '#007AFF',
        opacity: 0.7,
        animation: 'spin2 2s linear infinite'
    },
    innerRing: {
        width: '80px',
        height: '80px',
        borderTopColor: '#fffb00',
        borderRightColor: '#fffb00',
        borderBottomColor: '#fffb00',
        opacity: 0.8,
        animation: 'spin3 4s linear infinite'
    },
    centerPulse: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        backgroundColor: '#fffb00',
        boxShadow: '0 0 15px #fffb00',
        animation: 'pulse 2s ease infinite'
    },
    loadingDotsContainer: {
        display: 'flex',
        gap: '8px',
        marginTop: '20px'
    },
    loadingDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#007AFF',
        animation: 'dotPulse 1.4s ease infinite'
    },
    loadingText: {
        marginTop: '12px',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#F8FAFC',
        letterSpacing: '0.5px',
        textAlign: 'center'
    }
};

export default AdvancedLoadingScreen;