import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import './css/GuideSelector.css';

/**
 * GuideSelector Component
 * 
 * Modal component for selecting existing guides for modification. Fetches
 * and displays a list of all guides from Firestore, allowing users to
 * choose which guide to edit. Handles loading states and empty results.
 * 
 * Features:
 * - Fetches guides from Firestore
 * - Displays guides in chronological order
 * - Loading and empty state handling
 * - Guide selection for editing
 * - Error handling for database operations
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onGuideSelect - Callback when guide is selected
 * @param {Function} props.onClose - Callback to close selector
 * @returns {JSX.Element} Guide selection interface
 */
function GuideSelector({ onGuideSelect, onClose }) {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);

    /**
     * Fetch guides from Firestore on component mount
     * 
     * Retrieves all guide posts ordered by creation date (newest first)
     * and updates component state with fetched data.
     */
    useEffect(() => {
        const fetchGuides = async () => {
            try {
                const q = query(
                    collection(db, 'posts'),
                    orderBy('created_at', 'desc')
                );
                const querySnapshot = await getDocs(q);
                const fetchedGuides = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setGuides(fetchedGuides);
            } catch (error) {
                console.error('Error fetching guides:', error);
                alert('Error loading guides. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchGuides();
    }, []);

    if (loading) {
        return <div className="guide-selector-loading">Loading guides...</div>;
    }

    if (guides.length === 0) {
        return (
            <div className="guide-selector-empty">
                <p>No guides found.</p>
                <button className="adm-button" onClick={onClose}>Close</button>
            </div>
        );
    }

    return (
        <div className="guide-selector">
            <h2>Select Guide to Modify</h2>
            <div className="guides-list">
                {guides.map(guide => (
                    <div 
                        key={guide.id} 
                        className="guide-item"
                        onClick={() => onGuideSelect(guide)}
                    >
                        <h3>{guide.title}</h3>
                        <div className="guide-meta">
                            <span>{guide.type}</span>
                            <span>•</span>
                            <span>{guide.category}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="guide-selector-actions">
                <button className="adm-button red" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

GuideSelector.propTypes = {
    onGuideSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired
};

export default GuideSelector;