/**
 * Auth.jsx - Authentication management component
 * 
 * Main authentication interface that handles user login and registration.
 * Provides tabs for switching between login and register modes, integrates
 * with Firebase Authentication, and supports both email/password and Google
 * sign-in methods.
 * 
 * Features:
 * - Tabbed interface for Login/Register
 * - Email/password authentication
 * - Google OAuth integration
 * - Form validation and error handling
 * - Responsive design
 * - Success/error notifications
 * - Automatic redirection after authentication
 */

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import Login from './Login';
import Register from './Register';
import './css/Auth.css';

/**
 * Auth Component
 * 
 * Container component that provides tabbed interface for authentication.
 * Manages switching between login and registration forms and handles
 * authentication state management.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onAuthSuccess - Callback function called when authentication succeeds
 * @returns {JSX.Element} Authentication interface with login/register tabs
 */
function Auth({ onAuthSuccess }) {
    const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'

    /**
     * Switch between login and register tabs
     * 
     * @param {string} tab - The tab to switch to ('login' or 'register')
     */
    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
    };

    return (
        <div className="auth-card">
            {/* Header with logo and title */}
            <div className="auth-header">
                <img src="/assets/adventuro-logo-min.png" alt="AdventuroMaps" className="auth-logo" />
                <h1>AdventuroMaps</h1>
                <p>Discover and explore amazing adventures</p>
            </div>

            {/* Tab navigation */}
            <div className="auth-tabs">
                <button 
                    className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                    onClick={() => handleTabSwitch('login')}
                >
                    <FontAwesomeIcon icon={faUser} />
                    Login
                </button>
                <button 
                    className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                    onClick={() => handleTabSwitch('register')}
                >
                    <FontAwesomeIcon icon={faEnvelope} />
                    Register
                </button>
            </div>

            {/* Tab content */}
            <div className="auth-content">
                {activeTab === 'login' ? (
                    <Login 
                        onSwitchToRegister={() => handleTabSwitch('register')} 
                        onAuthSuccess={onAuthSuccess}
                    />
                ) : (
                    <Register 
                        onSwitchToLogin={() => handleTabSwitch('login')} 
                        onAuthSuccess={onAuthSuccess}
                    />
                )}
            </div>
        </div>
    );
}

export default Auth;