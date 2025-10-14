/**
 * UserDebug.jsx - Debug component for user data visualization
 * 
 * Development helper component to visualize user authentication state
 * and Firestore user document data. Useful for debugging and testing.
 */

import React, { useState, useEffect } from 'react';
import { getUserDocument } from '../../services/userService';

/**
 * UserDebug Component
 * 
 * Displays current user information and Firestore document data
 * for debugging purposes. Only shown in development mode.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - Current Firebase user object
 * @returns {JSX.Element} Debug information display
 */
function UserDebug({ user }) {
    const [userDocument, setUserDocument] = useState(null);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        if (user) {
            fetchUserDocument();
        } else {
            setUserDocument(null);
        }
    }, [user]);
    
    const fetchUserDocument = async () => {
        if (!user) return;
        
        setLoading(true);
        try {
            const doc = await getUserDocument(user.uid);
            setUserDocument(doc);
        } catch (error) {
            console.error('Error fetching user document:', error);
        } finally {
            setLoading(false);
        }
    };
    
    // Only show in development
    if (import.meta.env.MODE !== 'development') {
        return null;
    }
    
    if (!user) {
        return (
            <div style={{ 
                position: 'fixed', 
                top: 10, 
                right: 10, 
                background: 'rgba(0,0,0,0.8)', 
                color: 'white', 
                padding: '10px', 
                borderRadius: '5px',
                fontSize: '12px',
                zIndex: 10001,
                maxWidth: '300px'
            }}>
                <strong>User Debug</strong><br />
                Status: Not logged in
            </div>
        );
    }
    
    return (
        <div style={{ 
            position: 'fixed', 
            top: 10, 
            right: 10, 
            background: 'rgba(0,0,0,0.8)', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 10001,
            maxWidth: '300px',
            maxHeight: '400px',
            overflow: 'auto'
        }}>
            <strong>User Debug</strong>
            <button 
                onClick={fetchUserDocument}
                style={{ 
                    marginLeft: '10px', 
                    fontSize: '10px', 
                    padding: '2px 6px' 
                }}
            >
                Refresh
            </button>
            <br />
            
            <div style={{ marginTop: '10px' }}>
                <strong>Auth User:</strong><br />
                UID: {user.uid}<br />
                Email: {user.email}<br />
                Name: {user.displayName || 'N/A'}<br />
                Verified: {user.emailVerified ? 'Yes' : 'No'}
            </div>
            
            <div style={{ marginTop: '10px' }}>
                <strong>Firestore Document:</strong><br />
                {loading ? (
                    'Loading...'
                ) : userDocument ? (
                    <pre style={{ 
                        fontSize: '10px', 
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                    }}>
                        {JSON.stringify(userDocument, null, 2)}
                    </pre>
                ) : (
                    'No document found'
                )}
            </div>
        </div>
    );
}

export default UserDebug;