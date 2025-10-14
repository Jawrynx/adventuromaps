import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './css/Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMap, faCompass, faHatCowboy, faBook, faGear, faQuestionCircle, faTools, faBars, faTimes, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

/**
 * Sidebar Component
 * 
 * Main navigation sidebar providing access to all application features.
 * Features collapsible design with icons and labels, active state tracking,
 * and responsive behavior that communicates with parent layout components.
 * 
 * Features:
 * - Collapsible sidebar with toggle functionality
 * - Icon-based navigation with FontAwesome icons
 * - Active state indication for current page/feature
 * - Auto-close on mobile/item selection
 * - Layout communication for responsive design
 * - Route-aware active states
 * - Accessible navigation structure
 * 
 * @param {Object} props - Component props
 * @param {string} props.activeItem - Currently active navigation item
 * @param {Function} props.onSidebarClick - Callback when navigation item is clicked
 * @param {Function} props.onSidebarToggle - Callback when sidebar open/close state changes
 * @param {Object} props.user - Current authenticated user (null if not logged in)
 * @param {Function} props.onLogout - Callback to handle user logout
 * @returns {JSX.Element} Collapsible navigation sidebar
 */
function Sidebar({ activeItem, onSidebarClick, onSidebarToggle, user, onLogout }) {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    /**
     * Toggle sidebar open/closed state
     * 
     * Updates local state and notifies parent component of layout change
     * for responsive design adjustments.
     */
    const toggleSidebar = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        if (onSidebarToggle) {
            onSidebarToggle(newState);
        }
    };

    /**
     * Handle navigation item selection
     * 
     * Notifies parent of navigation choice and auto-closes sidebar
     * if currently open for better mobile experience.
     * 
     * @param {string} item - Selected navigation item identifier
     * @param {string} path - Route path for navigation
     */
    const handleSidebarClick = (item, path) => {
        onSidebarClick(item, path);

        // Auto-close sidebar after selection for better mobile UX
        if (isOpen) {
            setIsOpen(false);
            if (onSidebarToggle) {
                onSidebarToggle(false);
            }
        }
    };

    return (
        <div id='sidebar' className={isOpen ? 'open' : 'closed'}>
            <div className='sidebar-links'>
                <div className="menu-toggle" onClick={toggleSidebar}>
                    <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
                </div>
                <div
                    className={`sidebar-link ${location.pathname === '/' && activeItem === 'map' ? 'active' : ''}`}
                    onClick={() => handleSidebarClick('map', '/')}
                >
                    <FontAwesomeIcon icon={faMap} />
                    {isOpen && <p>Map</p>}
                </div>
                <div
                    className={`sidebar-link ${activeItem === 'explore' ? 'active' : ''}`}
                    onClick={() => handleSidebarClick('explore', '/')}
                >
                    <FontAwesomeIcon icon={faCompass} />
                    {isOpen && <p>Explore</p>}
                </div>
                <div
                    className={`sidebar-link ${activeItem === 'adventures' ? 'active' : ''}`}
                    onClick={() => handleSidebarClick('adventures', '/')}
                >
                    <FontAwesomeIcon icon={faHatCowboy} />
                    {isOpen && <p>Adventures</p>}
                </div>

                <div
                    className={`sidebar-link ${location.pathname === '/guides' ? 'active' : ''}`}
                    onClick={() => handleSidebarClick('guides', '/guides')}
                >
                    <FontAwesomeIcon icon={faBook} />
                    {isOpen && <p>Guides/Safety</p>}
                </div>
                <div
                    className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`}
                    onClick={() => handleSidebarClick('admin', '/admin')}
                >
                    <FontAwesomeIcon icon={faTools} />
                    {isOpen && <p>Admin Tools</p>}
                </div>
            </div>
            <div className='sidebar-footer'>
                {user ? (
                    <div
                        className="sidebar-link"
                        onClick={onLogout}
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        {isOpen && <p>Logout</p>}
                    </div>
                ) : (
                    <div
                        className={`sidebar-link ${activeItem === 'auth' ? 'active' : ''}`}
                        onClick={() => handleSidebarClick('auth', '/')}
                    >
                        <FontAwesomeIcon icon={faUser} />
                        {isOpen && <p>Login / Register</p>}
                    </div>
                )}
                <div
                    className={`sidebar-link ${location.pathname === '/settings' ? 'active' : ''}`}
                    onClick={() => handleSidebarClick('settings', '/settings')}
                >
                    <FontAwesomeIcon icon={faGear} />
                    {isOpen && <p>Settings</p>}
                </div>
                <div
                    className={`sidebar-link ${location.pathname === '/help' ? 'active' : ''}`}
                    onClick={() => handleSidebarClick('help', '/help')}
                >
                    <FontAwesomeIcon icon={faQuestionCircle} />
                    {isOpen && <p>Help</p>}
                </div>
                {isOpen &&
                    <span className='sidebar-logo'>
                        <img src="/assets/adventuro-logo-min.png" alt="" width="32px" />
                        AdventuroMaps v0.1.0
                    </span>
                }
            </div>
        </div>
    );
}

export default Sidebar;