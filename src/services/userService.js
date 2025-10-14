/**
 * userService.js - User profile and data management service
 * 
 * Handles user document creation, updates, and retrieval in Firestore.
 * Manages user profile information, preferences, and metadata.
 */

import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Create or update user document in Firestore
 * 
 * Creates a user profile document when a user registers or signs in for the first time.
 * Updates existing document if it already exists.
 * 
 * @param {Object} user - Firebase user object
 * @param {Object} additionalData - Optional additional user data
 * @returns {Promise<Object>} The created/updated user document
 */
export const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return null;
    
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
        // Create new user document
        const userData = {
            displayName: user.displayName || additionalData.displayName || '',
            email: user.email,
            photoURL: user.photoURL || null,
            userType: additionalData.userType || 'user', // 'user' or 'admin'
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            preferences: {
                emailNotifications: true,
                pushNotifications: true,
            },
            profile: {
                bio: '',
                location: '',
                favoriteAdventures: [],
                completedRoutes: [],
            },
            stats: {
                routesCompleted: 0,
                totalDistance: 0,
                totalTime: 0,
            },
            ...additionalData
        };
        
        try {
            await setDoc(userRef, userData);
            console.log('User document created successfully');
            return { id: user.uid, ...userData };
        } catch (error) {
            console.error('Error creating user document:', error);
            throw error;
        }
    } else {
        // Update last login time for existing user
        try {
            await updateDoc(userRef, {
                lastLoginAt: serverTimestamp()
            });
            console.log('User login time updated');
            const updatedDoc = await getDoc(userRef);
            return { id: user.uid, ...updatedDoc.data() };
        } catch (error) {
            console.error('Error updating user document:', error);
            throw error;
        }
    }
};

/**
 * Get user document from Firestore
 * 
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User document data or null if not found
 */
export const getUserDocument = async (userId) => {
    if (!userId) return null;
    
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            return { id: userId, ...userDoc.data() };
        } else {
            console.log('No user document found');
            return null;
        }
    } catch (error) {
        console.error('Error getting user document:', error);
        throw error;
    }
};

/**
 * Update user profile information
 * 
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<Object>} Updated user document
 */
export const updateUserProfile = async (userId, profileData) => {
    if (!userId) throw new Error('User ID is required');
    
    try {
        const userRef = doc(db, 'users', userId);
        const updateData = {
            ...profileData,
            updatedAt: serverTimestamp()
        };
        
        await updateDoc(userRef, updateData);
        console.log('User profile updated successfully');
        
        // Return updated document
        const updatedDoc = await getDoc(userRef);
        return { id: userId, ...updatedDoc.data() };
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

/**
 * Update user preferences
 * 
 * @param {string} userId - User ID
 * @param {Object} preferences - Preferences to update
 * @returns {Promise<void>}
 */
export const updateUserPreferences = async (userId, preferences) => {
    if (!userId) throw new Error('User ID is required');
    
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            preferences: {
                ...preferences
            },
            updatedAt: serverTimestamp()
        });
        console.log('User preferences updated successfully');
    } catch (error) {
        console.error('Error updating user preferences:', error);
        throw error;
    }
};

/**
 * Add completed route to user stats
 * 
 * @param {string} userId - User ID
 * @param {Object} routeData - Route completion data
 * @returns {Promise<void>}
 */
export const addCompletedRoute = async (userId, routeData) => {
    if (!userId) throw new Error('User ID is required');
    
    try {
        const userDoc = await getUserDocument(userId);
        if (!userDoc) throw new Error('User document not found');
        
        const updatedStats = {
            routesCompleted: (userDoc.stats?.routesCompleted || 0) + 1,
            totalDistance: (userDoc.stats?.totalDistance || 0) + (routeData.distance || 0),
            totalTime: (userDoc.stats?.totalTime || 0) + (routeData.time || 0),
        };
        
        const updatedCompletedRoutes = [
            ...(userDoc.profile?.completedRoutes || []),
            {
                routeId: routeData.routeId,
                completedAt: serverTimestamp(),
                distance: routeData.distance,
                time: routeData.time
            }
        ];
        
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            'stats': updatedStats,
            'profile.completedRoutes': updatedCompletedRoutes,
            updatedAt: serverTimestamp()
        });
        
        console.log('Route completion added to user stats');
    } catch (error) {
        console.error('Error adding completed route:', error);
        throw error;
    }
};