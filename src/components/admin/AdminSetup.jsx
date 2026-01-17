/**
 * AdminSetup.jsx - One-time admin setup utility
 * 
 * Use this component to grant yourself admin privileges.
 * After the first admin is set up, this can be removed or disabled.
 */

import React, { useState, useEffect } from 'react';
import { auth, setAdminClaimFunction, checkAdminStatusFunction } from '../../services/firebase';

function AdminSetup() {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Check current admin status
                try {
                    const result = await checkAdminStatusFunction();
                    setIsAdmin(result.data.isAdmin);
                } catch (err) {
                    console.error('Failed to check admin status:', err);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleSetAdmin = async () => {
        if (!user) {
            setError('You must be logged in first');
            return;
        }

        setLoading(true);
        setMessage('');
        setError('');

        try {
            const result = await setAdminClaimFunction({ targetUserId: user.uid });
            setMessage(result.data.message);
            
            // Important: User needs to sign out and back in for claims to take effect
            setMessage(result.data.message + '\n\nPlease sign out and sign back in for changes to take effect.');
        } catch (err) {
            console.error('Failed to set admin claim:', err);
            setError(err.message || 'Failed to set admin privileges');
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await auth.signOut();
            setMessage('Signed out. Please sign back in to apply admin privileges.');
        } catch (err) {
            setError('Failed to sign out: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <h2 style={styles.title}>Admin Setup</h2>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>🔐 Admin Setup</h2>
                
                {!user ? (
                    <div>
                        <p style={styles.warning}>⚠️ You must be logged in to set up admin privileges.</p>
                        <p>Please log in first, then return to this page.</p>
                    </div>
                ) : (
                    <div>
                        <div style={styles.info}>
                            <p><strong>Logged in as:</strong> {user.email}</p>
                            <p><strong>User ID:</strong> <code style={styles.code}>{user.uid}</code></p>
                            <p><strong>Admin Status:</strong> {isAdmin ? '✅ Admin' : '❌ Not Admin'}</p>
                        </div>

                        {isAdmin ? (
                            <div style={styles.success}>
                                <p>✅ You already have admin privileges!</p>
                                <p>You can now upload audio and keyframes to Firebase Storage.</p>
                            </div>
                        ) : (
                            <div>
                                <p style={styles.description}>
                                    Click the button below to grant yourself admin privileges.
                                    This will allow you to upload to protected storage paths (audio/, keyframes/).
                                </p>
                                
                                <button 
                                    onClick={handleSetAdmin} 
                                    disabled={loading}
                                    style={styles.button}
                                >
                                    {loading ? 'Setting up...' : 'Grant Admin Privileges'}
                                </button>
                            </div>
                        )}

                        {message && (
                            <div style={styles.messageBox}>
                                <p style={styles.messageText}>{message}</p>
                                <button onClick={handleSignOut} style={styles.signOutButton}>
                                    Sign Out Now
                                </button>
                            </div>
                        )}

                        {error && (
                            <div style={styles.errorBox}>
                                <p>{error}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#0f1419',
        padding: '20px'
    },
    card: {
        backgroundColor: '#1a1f2e',
        borderRadius: '12px',
        padding: '30px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 165, 0, 0.3)'
    },
    title: {
        color: '#ffa500',
        marginBottom: '20px',
        textAlign: 'center'
    },
    info: {
        backgroundColor: 'rgba(100, 200, 255, 0.1)',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
    },
    code: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '12px',
        wordBreak: 'break-all'
    },
    description: {
        color: '#ccc',
        marginBottom: '20px',
        lineHeight: '1.5'
    },
    button: {
        width: '100%',
        padding: '12px 24px',
        backgroundColor: '#ffa500',
        color: '#0f1419',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    signOutButton: {
        marginTop: '10px',
        padding: '8px 16px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    warning: {
        color: '#f59e0b',
        fontWeight: '600'
    },
    success: {
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        padding: '15px',
        borderRadius: '8px',
        color: '#22c55e'
    },
    messageBox: {
        marginTop: '20px',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        padding: '15px',
        borderRadius: '8px',
        color: '#60a5fa'
    },
    messageText: {
        whiteSpace: 'pre-line'
    },
    errorBox: {
        marginTop: '20px',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        padding: '15px',
        borderRadius: '8px',
        color: '#ef4444'
    }
};

export default AdminSetup;
