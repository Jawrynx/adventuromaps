/**
 * MainMap.jsx - Primary interactive map component
 * 
 * This component serves as the main map interface for AdventuroMaps, providing
 * the Google Maps integration and coordinating map-related functionality including
 * route display, waypoint navigation, and demo mode visualization.
 */

import React, { useEffect } from 'react';
import { Map } from '@vis.gl/react-google-maps';
import MapContent from './MapContent';
import { useSettings } from '../../services/SettingsContext.jsx';

/**
 * MainMap Component
 * 
 * The primary map interface that handles:
 * - Google Maps rendering and configuration
 * - Route visualization and demo path display
 * - Waypoint navigation and highlighting
 * - Map interaction controls and zoom management
 * - Street View link disabling for better UX
 * 
 * @param {Array|null} activeRoute - Currently selected route coordinates for display
 * @param {Array|null} activePathForDemo - Demo mode path coordinates
 * @param {Array} waypoints - Array of waypoint objects for demo navigation
 * @param {Object|null} activeWaypoint - Currently focused waypoint in demo mode
 * @param {string} mapId - Google Maps style ID for map theming
 * @param {number} zoomLevel - Current map zoom level
 * @param {boolean} isZooming - Whether map is currently in zoom animation
 * @param {Function} onSmoothPanReady - Callback when map's smooth pan function is available
 * @returns {JSX.Element} Interactive Google Maps component with route visualization
 */
function MainMap({ activeRoute, activePathForDemo, waypoints, activeWaypoint, mapId, zoomLevel, isZooming, onSmoothPanReady }) {
    // Get settings for reactive updates
    const { settings } = useSettings();

    /**
     * Disables Street View links to prevent unwanted navigation
     * 
     * Prevents users from accidentally navigating to Street View when clicking
     * on map elements. Adds event handlers to profile links, address links,
     * and marker links to prevent their default behavior.
     */
    useEffect(() => {
        const disableStreetViewLinks = () => {
            // Find all Street View related links in the map interface
            const profileLinks = document.querySelectorAll('.gm-iv-profile-url > a');
            const addressLinks = document.querySelectorAll('.gm-iv-address-link > a');
            const markerLinks = document.querySelectorAll('.gm-iv-marker > a');

            // Disable click events on all Street View links
            [...profileLinks, ...addressLinks, ...markerLinks].forEach(link => {
                if (link) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    });
                }
            });
        };
        
        // Delay execution to ensure map elements are loaded
        setTimeout(disableStreetViewLinks, 1000);

    }, []); 

    // Get map type from settings (reactive to changes)
    const mapType = settings.defaultMapType || 'terrain';
    console.log('🗺️ MainMap using mapType:', mapType);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Map
                defaultZoom={zoomLevel}
                defaultCenter={{ lat: 30, lng: 0 }}
                mapTypeId={mapType}
                mapId={mapId}
            >
                <MapContent 
                    activeRoute={activeRoute} 
                    activePathForDemo={activePathForDemo}
                    waypoints={waypoints}
                    activeWaypoint={activeWaypoint} 
                    zoomLevel={zoomLevel}
                    isZooming={isZooming}
                    onSmoothPanReady={onSmoothPanReady}
                />
            </Map>
        </div>
    );
}

export default MainMap;