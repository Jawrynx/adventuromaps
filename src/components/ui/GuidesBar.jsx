import React from 'react'

import './css/GuidesBar.css'

function GuidesBar() {
  return (
    <div id='guidesbar'>
        <div className="categories">
            <h2>Guides & Safety</h2>
            <div className="category">
                <h4>
                    Getting Started
                </h4>
            </div>
            <div className="category">
                <h4>
                    Using the Map & Routes
                </h4>
            </div>
            <div className="category">
                <h4>
                    Offline Maps & Sharing
                </h4>
            </div>
            <div className="category">
                <h4>
                    Personalizing Your Experience
                </h4>
            </div>
            <div className="category">
                <h4>
                    Trip Planning & Preparation
                </h4>
            </div>
            <div className="category">
                <h4>
                    Emergency & First Aid
                </h4>
            </div>
            <div className="category">
                <h4>
                    Navigation & Wayfinding
                </h4>
            </div>
            <div className="category">
                <h4>
                    Environmental Safety & Etiquette
                </h4>
            </div>
            <div className="category">
                <h4>
                    Activity-Specific Guides
                </h4>
            </div>
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
  )
}

export default GuidesBar;