import React from 'react';
import { useLocation } from 'react-router-dom';
import './Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap, faCompass, faHatCowboy, faBook, faGear, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

function Sidebar({ activeItem, onSidebarClick }) {
    const location = useLocation();

    return (
        <div id='sidebar'>
            <div className='sidebar-links'>
                <div 
                    className={`sidebar-link ${location.pathname === '/' && activeItem === 'map' ? 'active' : ''}`}
                    onClick={() => onSidebarClick('map', '/')}
                >
                    <FontAwesomeIcon icon={faMap} />
                    <p>Map</p>
                </div>
                <div 
                    className={`sidebar-link ${activeItem === 'explore' ? 'active' : ''}`}
                    onClick={() => onSidebarClick('explore', '/')}
                >
                    <FontAwesomeIcon icon={faCompass} />
                    <p>Explore</p>
                </div>
                <div 
                    className={`sidebar-link ${activeItem === 'adventures' ? 'active' : ''}`}
                    onClick={() => onSidebarClick('adventures', '/')}
                >
                    <FontAwesomeIcon icon={faHatCowboy} />
                    <p>Adventures</p>
                </div>

                <div 
                    className={`sidebar-link ${location.pathname === '/guides' ? 'active' : ''}`}
                    onClick={() => onSidebarClick('guides', '/guides')}
                >
                    <FontAwesomeIcon icon={faBook} />
                    <p>Guides/Safety</p>
                </div>
                <div 
                    className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}
                    onClick={() => onSidebarClick('settings', '/settings')}
                >
                    <FontAwesomeIcon icon={faGear} />
                    <p>Settings</p>
                </div>
            </div>
            <div className='sidebar-footer'>
                <div 
                    className={`sidebar-link ${location.pathname === '/help' ? 'active' : ''}`}
                    onClick={() => onSidebarClick('help', '/help')}
                >
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    <p>Help</p>
                </div>
                <span>AdventuroMaps v0.1.0</span>
            </div>
        </div>
    )
}

export default Sidebar;