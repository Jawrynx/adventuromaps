/**
 * Login.jsx - User login component
 * 
 * Handles user authentication via email/password and Google OAuth.
 * Provides form validation, error handling, and success feedback.
 * Integrates with Firebase Authentication for secure login management.
 */

import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

/**
 * Login Component
 * 
 * Provides user login functionality with email/password and Google OAuth.
 * Includes form validation, error handling, and user feedback.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSwitchToRegister - Callback to switch to register form
 * @param {Function} props.onAuthSuccess - Callback when authentication succeeds
 * @returns {JSX.Element} Login form interface
 */
function Login({ onSwitchToRegister, onAuthSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * Handle email/password login
     * 
     * @param {Event} e - Form submit event
     */
    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful:', userCredential.user);
            if (onAuthSuccess) {
                onAuthSuccess(userCredential.user);
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(getErrorMessage(error.code));
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle Google OAuth login
     */
    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('');

        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            console.log('Google login successful:', userCredential.user);
            if (onAuthSuccess) {
                onAuthSuccess(userCredential.user);
            }
        } catch (error) {
            console.error('Google login error:', error);
            setError(getErrorMessage(error.code));
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Convert Firebase error codes to user-friendly messages
     * 
     * @param {string} errorCode - Firebase error code
     * @returns {string} User-friendly error message
     */
    const getErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'No account found with this email address.';
            case 'auth/wrong-password':
                return 'Incorrect password. Please try again.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later.';
            case 'auth/user-disabled':
                return 'This account has been disabled.';
            default:
                return 'Login failed. Please check your credentials and try again.';
        }
    };

    return (
        <div className="login-form">
            <form onSubmit={handleEmailLogin}>
                {/* Error message display */}
                {error && <div className="auth-error">{error}</div>}

                {/* Email input */}
                <div className="input-group">
                    <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Password input */}
                <div className="input-group">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                    >
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                    </button>
                </div>

                {/* Login button */}
                <button 
                    type="submit" 
                    className="auth-button primary"
                    disabled={isLoading || !email || !password}
                >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>

            {/* Divider */}
            <div className="auth-divider">
                <span>or</span>
            </div>

            {/* Google login button */}
            <button 
                className="auth-button google"
                onClick={handleGoogleLogin}
                disabled={isLoading}
            >
                <FontAwesomeIcon icon={faGoogle} />
                Continue with Google
            </button>

            {/* Switch to register */}
            <div className="auth-switch">
                <p>
                    Don't have an account?{' '}
                    <button 
                        type="button" 
                        className="link-button"
                        onClick={onSwitchToRegister}
                        disabled={isLoading}
                    >
                        Create Account
                    </button>
                </p>
            </div>

            {/* Forgot password link */}
            <div className="auth-links">
                <button type="button" className="link-button small">
                    Forgot Password?
                </button>
            </div>
        </div>
    );
}

export default Login;