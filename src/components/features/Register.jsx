/**
 * Register.jsx - User registration component
 * 
 * Handles new user account creation via email/password and Google OAuth.
 * Provides form validation, password confirmation, error handling, and
 * success feedback. Integrates with Firebase Authentication.
 */

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

/**
 * Register Component
 * 
 * Provides user registration functionality with email/password and Google OAuth.
 * Includes form validation, password confirmation, error handling, and user feedback.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSwitchToLogin - Callback to switch to login form
 * @param {Function} props.onAuthSuccess - Callback when authentication succeeds
 * @returns {JSX.Element} Registration form interface
 */
function Register({ onSwitchToLogin, onAuthSuccess }) {
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * Handle form input changes
     * 
     * @param {Event} e - Input change event
     */
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /**
     * Validate form data
     * 
     * @returns {string|null} Error message if validation fails, null if valid
     */
    const validateForm = () => {
        if (formData.password.length < 6) {
            return 'Password must be at least 6 characters long.';
        }
        
        if (formData.password !== formData.confirmPassword) {
            return 'Passwords do not match.';
        }

        if (formData.displayName.trim().length < 2) {
            return 'Display name must be at least 2 characters long.';
        }

        return null;
    };

    /**
     * Handle email/password registration
     * 
     * @param {Event} e - Form submit event
     */
    const handleEmailRegister = async (e) => {
        e.preventDefault();
        setError('');

        // Validate form
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);

        try {
            // Create user account
            const userCredential = await createUserWithEmailAndPassword(
                auth, 
                formData.email, 
                formData.password
            );

            // Update display name
            await updateProfile(userCredential.user, {
                displayName: formData.displayName
            });

            console.log('Registration successful:', userCredential.user);
            if (onAuthSuccess) {
                onAuthSuccess(userCredential.user);
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError(getErrorMessage(error.code));
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle Google OAuth registration
     */
    const handleGoogleRegister = async () => {
        setIsLoading(true);
        setError('');

        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(auth, provider);
            console.log('Google registration successful:', userCredential.user);
            if (onAuthSuccess) {
                onAuthSuccess(userCredential.user);
            }
        } catch (error) {
            console.error('Google registration error:', error);
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
            case 'auth/email-already-in-use':
                return 'An account with this email address already exists.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/weak-password':
                return 'Password is too weak. Please choose a stronger password.';
            case 'auth/operation-not-allowed':
                return 'Email/password accounts are not enabled.';
            default:
                return 'Registration failed. Please try again.';
        }
    };

    return (
        <div className="register-form">
            <form onSubmit={handleEmailRegister}>
                {/* Error message display */}
                {error && <div className="auth-error">{error}</div>}

                {/* Display name input */}
                <div className="input-group">
                    <FontAwesomeIcon icon={faUser} className="input-icon" />
                    <input
                        type="text"
                        name="displayName"
                        placeholder="Full Name"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Email input */}
                <div className="input-group">
                    <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                    />
                </div>

                {/* Password input */}
                <div className="input-group">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Password (min. 6 characters)"
                        value={formData.password}
                        onChange={handleInputChange}
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

                {/* Confirm password input */}
                <div className="input-group">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                    />
                    <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isLoading}
                    >
                        <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                    </button>
                </div>

                {/* Register button */}
                <button 
                    type="submit" 
                    className="auth-button primary"
                    disabled={isLoading || !formData.email || !formData.password || !formData.displayName}
                >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>

            {/* Divider */}
            <div className="auth-divider">
                <span>or</span>
            </div>

            {/* Google register button */}
            <button 
                className="auth-button google"
                onClick={handleGoogleRegister}
                disabled={isLoading}
            >
                <FontAwesomeIcon icon={faGoogle} />
                Continue with Google
            </button>

            {/* Switch to login */}
            <div className="auth-switch">
                <p>
                    Already have an account?{' '}
                    <button 
                        type="button" 
                        className="link-button"
                        onClick={onSwitchToLogin}
                        disabled={isLoading}
                    >
                        Sign In
                    </button>
                </p>
            </div>

            {/* Terms and privacy */}
            <div className="auth-terms">
                <p>
                    By creating an account, you agree to our{' '}
                    <button type="button" className="link-button small">Terms of Service</button>
                    {' '}and{' '}
                    <button type="button" className="link-button small">Privacy Policy</button>.
                </p>
            </div>
        </div>
    );
}

export default Register;