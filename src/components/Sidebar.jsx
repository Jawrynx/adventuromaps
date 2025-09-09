import React from 'react'
import './Sidebar.css';

function Sidebar() {
  return (
    <div id='sidebar'>
        <div className='sidebar-links'>
            <div className="sidebar-link">
                <p>Map</p>
            </div>
            <div className="sidebar-link">
                <p>Explore</p>
            </div>
            <div className='sidebar-link'>
                <p>Adventures</p>
            </div>
            <div className='sidebar-link'>
                <p>Guides/Safety</p>
            </div>
            <div className='sidebar-link'>
                <p>Settings</p>
            </div>
        </div>
        <div className='sidebar-footer'>
            <div className='sidebar-link'>
                <p>Help</p>
            </div>
            <span>AdventuroMaps v0.1.0</span>
        </div>
    </div>
  )
}

export default Sidebar