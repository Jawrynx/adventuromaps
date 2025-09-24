import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import './css/GuideSelector.css';

function GuideSelector({ onGuideSelect, onClose }) {
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);

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