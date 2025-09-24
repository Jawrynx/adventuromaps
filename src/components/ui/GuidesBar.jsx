import React from 'react'
import PropTypes from 'prop-types'
import './css/GuidesBar.css'

function GuidesBar({ onCategorySelect }) {
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
            <button className='adm-button green'>
                Create a Guide
            </button>
            <button className='adm-button blue'>
                Modify existing Guide
            </button>
        </div>
    </div>
  );
}

GuidesBar.propTypes = {
  onCategorySelect: PropTypes.func.isRequired
};

export default GuidesBar;