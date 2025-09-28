import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Modal from './Modal'
import GuideForm from './GuideForm'
import GuideSelector from './GuideSelector'
import './css/GuidesBar.css'

/**
 * GuidesBar Component
 * 
 * Navigation sidebar for the guides and safety section providing categorized
 * access to help content and administrative functions. Displays category
 * buttons for content filtering and admin controls for content management.
 * 
 * Features:
 * - Categorized guide navigation
 * - Create new guide functionality  
 * - Edit existing guide selection
 * - Modal-based guide management forms
 * - Organized content categories for outdoor activities
 * - Admin tools for content creators
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onCategorySelect - Callback when category is selected
 * @returns {JSX.Element} Guides navigation sidebar
 */
function GuidesBar({ onCategorySelect }) {
    // Modal state management for guide creation and editing
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showModifySelector, setShowModifySelector] = useState(false);
    const [selectedGuide, setSelectedGuide] = useState(null);

    // Predefined categories for organizing guide content
  const categories = [
    'Getting Started',
    'Using the Map & Routes',
    'Offline Maps & Sharing',
    'Personalizing Your Experience',
    'Trip Planning & Preparation',
    'Emergency & First Aid',
    'Navigation & Wayfinding',
    'Environmental Safety & Etiquette',
    'Activity-Specific Guides'
  ];

  return (
    <div id='guidesbar'>
        <div className="categories">
            <h2>Guides & Safety</h2>
            {categories.map((category) => (
                <div 
                    key={category} 
                    className="category"
                    onClick={() => onCategorySelect(category)}
                    role="button"
                    tabIndex={0}
                >
                    <h4>{category}</h4>
                </div>
            ))}
        </div>
        <div className="admin">
            <button 
                className='adm-button green'
                onClick={() => setShowCreateForm(true)}
            >
                Create a Guide
            </button>
            <button 
                className='adm-button blue'
                onClick={() => setShowModifySelector(true)}
            >
                Modify existing Guide
            </button>
        </div>

        {/* Create Guide Modal */}
        {showCreateForm && (
            <Modal>
                <GuideForm
                    onClose={() => setShowCreateForm(false)}
                    onSuccess={() => {
                        alert('Guide created successfully!');
                        // You might want to refresh the guides list here
                    }}
                />
            </Modal>
        )}

        {/* Modify Guide Modal */}
        {showModifySelector && !selectedGuide && (
            <Modal>
                <GuideSelector
                    onGuideSelect={(guide) => {
                        setSelectedGuide(guide);
                        setShowModifySelector(false);
                    }}
                    onClose={() => setShowModifySelector(false)}
                />
            </Modal>
        )}

        {/* Edit Guide Modal */}
        {selectedGuide && (
            <Modal>
                <GuideForm
                    existingGuide={selectedGuide}
                    onClose={() => setSelectedGuide(null)}
                    onSuccess={() => {
                        alert('Guide updated successfully!');
                        setSelectedGuide(null);
                        // You might want to refresh the guides list here
                    }}
                />
            </Modal>
        )}
    </div>
  );
}

GuidesBar.propTypes = {
  onCategorySelect: PropTypes.func.isRequired
};

export default GuidesBar;