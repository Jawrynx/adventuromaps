/**
 * Profile.jsx - User profile management page
 * 
 * Comprehensive user profile page allowing users to view and edit their
 * personal information, preferences, statistics, and account settings.
 * Integrates with Firestore for real-time data management.
 * 
 * Features:
 * - Profile information editing (name, bio, location, photo)
 * - Account preferences (notifications)
 * - Activity statistics (routes completed, distance traveled)
 * - Account management (email, password, delete account)
 * - Real-time data synchronization with Firestore
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUser, faEnvelope, faMapMarkerAlt, faEdit, faSave, faTimes, 
    faCamera, faBell, faPalette, faRoute, faRuler, faClock,
    faKey, faTrash, faEye, faEyeSlash, faTools 
} from '@fortawesome/free-solid-svg-icons';
import { updatePassword, updateEmail, deleteUser, updateProfile } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { getUserDocument, updateUserProfile, updateUserPreferences } from '../../services/userService';
import { uploadFile } from '../../services/uploadService';
import './css/Profile.css';

/**
 * Profile Component
 * 
 * Main user profile interface with tabs for different sections:
 * - Profile: Personal information and bio
 * - Preferences: App settings and notifications
 * - Statistics: Activity data and achievements
 * - Account: Security and account management
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - Current authenticated user
 * @returns {JSX.Element} Complete profile management interface
 */
function Profile({ user }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [userDocument, setUserDocument] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Form states
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        location: '',
        preferences: {
            emailNotifications: true,
            pushNotifications: true,
        }
    });
    
    // Account management states
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            loadUserDocument();
        }
    }, [user]);

    /**
     * Handle profile picture upload
     */
    const handleProfilePictureUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        setIsUploadingPhoto(true);
        setError('');
        setSuccess('');

        try {
            // Upload image to Firebase Storage
            const fileName = `profile-pictures/${user.uid}/${Date.now()}_${file.name}`;
            const photoURL = await uploadFile(file, fileName);

            // Update Firebase Auth profile
            await updateProfile(auth.currentUser, {
                photoURL: photoURL
            });

            // Update Firestore user document
            await updateUserProfile(user.uid, {
                photoURL: photoURL
            });

            setSuccess('Profile picture updated successfully!');
            await loadUserDocument(); // Reload to get updated data
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error updating profile picture:', error);
            setError('Failed to update profile picture. Please try again.');
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    /**
     * Trigger file input click
     */
    const triggerFileInput = () => {
        const fileInput = document.getElementById('profile-picture-input');
        if (fileInput) {
            fileInput.click();
        }
    };

    /**
     * Load user document from Firestore
     */
    const loadUserDocument = async () => {
        setIsLoading(true);
        try {
            const doc = await getUserDocument(user.uid);
            if (doc) {
                setUserDocument(doc);
                setFormData({
                    displayName: doc.displayName || user.displayName || '',
                    bio: doc.profile?.bio || '',
                    location: doc.profile?.location || '',
                    preferences: {
                        emailNotifications: doc.preferences?.emailNotifications !== false,
                        pushNotifications: doc.preferences?.pushNotifications !== false,
                    }
                });
            }
        } catch (error) {
            console.error('Error loading user document:', error);
            setError('Failed to load profile data');
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle form input changes
     */
    const handleInputChange = (field, value) => {
        if (field.startsWith('preferences.')) {
            const prefField = field.replace('preferences.', '');
            setFormData(prev => ({
                ...prev,
                preferences: {
                    ...prev.preferences,
                    [prefField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    /**
     * Save profile changes
     */
    const handleSaveProfile = async () => {
        setIsSaving(true);
        setError('');
        setSuccess('');

        try {
            // Update profile information
            const profileUpdate = {
                displayName: formData.displayName,
                'profile.bio': formData.bio,
                'profile.location': formData.location,
            };

            await updateUserProfile(user.uid, profileUpdate);
            
            // Update preferences separately
            await updateUserPreferences(user.uid, formData.preferences);
            
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            await loadUserDocument(); // Reload to get updated data
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Cancel editing
     */
    const handleCancelEdit = () => {
        setIsEditing(false);
        setError('');
        setSuccess('');
        // Reset form data
        if (userDocument) {
            setFormData({
                displayName: userDocument.displayName || user.displayName || '',
                bio: userDocument.profile?.bio || '',
                location: userDocument.profile?.location || '',
                preferences: {
                    emailNotifications: userDocument.preferences?.emailNotifications !== false,
                    pushNotifications: userDocument.preferences?.pushNotifications !== false,
                }
            });
        }
    };

    /**
     * Format date for display
     */
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    /**
     * Format time duration
     */
    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    if (isLoading) {
        return (
            <div className="profile-container">
                <div className="profile-loading">
                    <FontAwesomeIcon icon={faUser} spin />
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" />
                    ) : (
                        <FontAwesomeIcon icon={faUser} />
                    )}
                    <button 
                        className="avatar-edit-btn"
                        onClick={triggerFileInput}
                        disabled={isUploadingPhoto}
                        title="Change profile picture"
                    >
                        <FontAwesomeIcon icon={isUploadingPhoto ? faUser : faCamera} spin={isUploadingPhoto} />
                    </button>
                    {/* Hidden file input */}
                    <input
                        id="profile-picture-input"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        style={{ display: 'none' }}
                    />
                </div>
                <div className="profile-basic-info">
                    <div className="profile-name-container">
                        <h1>{userDocument?.displayName || user.displayName || 'User'}</h1>
                        {userDocument?.userType === 'admin' && (
                            <span className="admin-badge">
                                <FontAwesomeIcon icon={faTools} />
                                Admin
                            </span>
                        )}
                    </div>
                    <p className="profile-email">
                        <FontAwesomeIcon icon={faEnvelope} />
                        {user.email}
                    </p>
                    {userDocument?.profile?.location && (
                        <p className="profile-location">
                            <FontAwesomeIcon icon={faMapMarkerAlt} />
                            {userDocument.profile.location}
                        </p>
                    )}
                </div>
                <div className="profile-actions">
                    {!isEditing ? (
                        <button 
                            className="btn-primary"
                            onClick={() => setIsEditing(true)}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                            Edit Profile
                        </button>
                    ) : (
                        <div className="edit-actions">
                            <button 
                                className="btn-success"
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                            >
                                <FontAwesomeIcon icon={faSave} />
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                                className="btn-secondary"
                                onClick={handleCancelEdit}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Error/Success Messages */}
            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            {/* Tab Navigation */}
            <div className="profile-tabs">
                <button 
                    className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    <FontAwesomeIcon icon={faUser} />
                    Profile
                </button>
                <button 
                    className={`tab ${activeTab === 'preferences' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preferences')}
                >
                    <FontAwesomeIcon icon={faPalette} />
                    Preferences
                </button>
                <button 
                    className={`tab ${activeTab === 'statistics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('statistics')}
                >
                    <FontAwesomeIcon icon={faRoute} />
                    Statistics
                </button>
                <button 
                    className={`tab ${activeTab === 'account' ? 'active' : ''}`}
                    onClick={() => setActiveTab('account')}
                >
                    <FontAwesomeIcon icon={faKey} />
                    Account
                </button>
                {/* Admin tab - only show for admin users */}
                {userDocument?.userType === 'admin' && (
                    <button 
                        className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
                        onClick={() => setActiveTab('admin')}
                    >
                        <FontAwesomeIcon icon={faTools} />
                        Admin
                    </button>
                )}
            </div>

            {/* Tab Content */}
            <div className="profile-content">
                {activeTab === 'profile' && (
                    <div className="tab-content">
                        <h2>Profile Information</h2>
                        
                        <div className="form-group">
                            <label>Display Name</label>
                            <input
                                type="text"
                                value={formData.displayName}
                                onChange={(e) => handleInputChange('displayName', e.target.value)}
                                disabled={!isEditing}
                                placeholder="Enter your display name"
                            />
                        </div>

                        <div className="form-group">
                            <label>Bio</label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => handleInputChange('bio', e.target.value)}
                                disabled={!isEditing}
                                placeholder="Tell us about yourself..."
                                rows={4}
                            />
                        </div>

                        <div className="form-group">
                            <label>Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => handleInputChange('location', e.target.value)}
                                disabled={!isEditing}
                                placeholder="City, Country"
                            />
                        </div>

                        <div className="profile-meta">
                            <p><strong>Member since:</strong> {formatDate(userDocument?.createdAt)}</p>
                            <p><strong>Last login:</strong> {formatDate(userDocument?.lastLoginAt)}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'preferences' && (
                    <div className="tab-content">
                        <h2>App Preferences</h2>
                        <div className="form-group checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.preferences.emailNotifications}
                                    onChange={(e) => handleInputChange('preferences.emailNotifications', e.target.checked)}
                                    disabled={!isEditing}
                                />
                                Email Notifications
                            </label>
                            <p className="help-text">Receive notifications about new features and updates</p>
                        </div>

                        <div className="form-group checkbox">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={formData.preferences.pushNotifications}
                                    onChange={(e) => handleInputChange('preferences.pushNotifications', e.target.checked)}
                                    disabled={!isEditing}
                                />
                                Push Notifications
                            </label>
                            <p className="help-text">Receive push notifications in the app</p>
                        </div>
                    </div>
                )}

                {activeTab === 'statistics' && (
                    <div className="tab-content">
                        <h2>Your Adventure Statistics</h2>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <FontAwesomeIcon icon={faRoute} className="stat-icon" />
                                <div className="stat-content">
                                    <h3>{userDocument?.stats?.routesCompleted || 0}</h3>
                                    <p>Routes Completed</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <FontAwesomeIcon icon={faRuler} className="stat-icon" />
                                <div className="stat-content">
                                    <h3>{Math.round((userDocument?.stats?.totalDistance || 0) / 1000)} km</h3>
                                    <p>Total Distance</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <FontAwesomeIcon icon={faClock} className="stat-icon" />
                                <div className="stat-content">
                                    <h3>{formatDuration(userDocument?.stats?.totalTime || 0)}</h3>
                                    <p>Total Time</p>
                                </div>
                            </div>
                        </div>

                        {userDocument?.profile?.completedRoutes?.length > 0 && (
                            <div className="recent-routes">
                                <h3>Recent Adventures</h3>
                                <div className="routes-list">
                                    {userDocument.profile.completedRoutes.slice(-5).reverse().map((route, index) => (
                                        <div key={index} className="route-item">
                                            <div className="route-info">
                                                <h4>Route {route.routeId}</h4>
                                                <p>{formatDate(route.completedAt)}</p>
                                            </div>
                                            <div className="route-stats">
                                                <span>{Math.round(route.distance / 1000)} km</span>
                                                <span>{formatDuration(route.time)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'account' && (
                    <div className="tab-content">
                        <h2>Account Settings</h2>

                        <div className="account-section">
                            <h3>Email Address</h3>
                            <p>Your current email: <strong>{user.email}</strong></p>
                            <p className="help-text">
                                Email verification status: {user.emailVerified ? '✅ Verified' : '❌ Not verified'}
                            </p>
                        </div>

                        <div className="account-section">
                            <h3>Password</h3>
                            <button 
                                className="btn-secondary"
                                onClick={() => setShowPasswordChange(!showPasswordChange)}
                            >
                                Change Password
                            </button>
                            
                            {showPasswordChange && (
                                <div className="password-change-form">
                                    <div className="form-group">
                                        <label>Current Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData(prev => ({
                                                ...prev,
                                                currentPassword: e.target.value
                                            }))}
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>New Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData(prev => ({
                                                ...prev,
                                                newPassword: e.target.value
                                            }))}
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData(prev => ({
                                                ...prev,
                                                confirmPassword: e.target.value
                                            }))}
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button className="btn-primary">Update Password</button>
                                        <button 
                                            className="btn-secondary"
                                            onClick={() => setShowPasswordChange(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="account-section danger-zone">
                            <h3>Danger Zone</h3>
                            <p className="help-text">
                                These actions cannot be undone. Please proceed with caution.
                            </p>
                            <button className="btn-danger">
                                <FontAwesomeIcon icon={faTrash} />
                                Delete Account
                            </button>
                        </div>
                    </div>
                )}

                {/* Admin Tab Content - only for admin users */}
                {activeTab === 'admin' && userDocument?.userType === 'admin' && (
                    <div className="tab-content">
                        <h2>Admin Panel</h2>
                        <p className="admin-welcome">
                            Welcome to the admin panel. You have administrative privileges on this platform.
                        </p>

                        <div className="admin-info-section">
                            <h3>Admin Information</h3>
                            <div className="admin-info-grid">
                                <div className="admin-info-card">
                                    <h4>User Type</h4>
                                    <p>{userDocument.userType}</p>
                                </div>
                                <div className="admin-info-card">
                                    <h4>Admin Since</h4>
                                    <p>{formatDate(userDocument.createdAt)}</p>
                                </div>
                                <div className="admin-info-card">
                                    <h4>Admin Level</h4>
                                    <p>Full Access</p>
                                </div>
                            </div>
                        </div>

                        <div className="admin-actions-section">
                            <h3>Admin Actions</h3>
                            <div className="admin-actions-grid">
                                <div className="admin-action-card">
                                    <FontAwesomeIcon icon={faTools} className="admin-action-icon" />
                                    <h4>Admin Tools</h4>
                                    <p>Access the full admin dashboard with advanced tools and settings.</p>
                                    <button 
                                        className="btn-primary"
                                        onClick={() => window.location.href = '/admin'}
                                    >
                                        Open Admin Tools
                                    </button>
                                </div>
                                <div className="admin-action-card">
                                    <FontAwesomeIcon icon={faUser} className="admin-action-icon" />
                                    <h4>User Management</h4>
                                    <p>Manage user accounts, permissions, and access levels.</p>
                                    <button className="btn-secondary" disabled>
                                        Coming Soon
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="admin-stats-section">
                            <h3>System Overview</h3>
                            <div className="admin-stats-grid">
                                <div className="admin-stat-card">
                                    <h4>Total Users</h4>
                                    <p className="admin-stat-number">-</p>
                                    <span className="admin-stat-label">Registered</span>
                                </div>
                                <div className="admin-stat-card">
                                    <h4>Active Routes</h4>
                                    <p className="admin-stat-number">-</p>
                                    <span className="admin-stat-label">Available</span>
                                </div>
                                <div className="admin-stat-card">
                                    <h4>Admin Users</h4>
                                    <p className="admin-stat-number">-</p>
                                    <span className="admin-stat-label">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;