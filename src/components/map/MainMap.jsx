/**
 * MainMap.jsx - Primary interactive map component
 * 
 * This component serves as the main map interface for AdventuroMaps, providin                <Map
                defaultZoom={zoomLevel}
                defaultCenter={{ lat: 30, lng: 0 }}
                mapTypeId={mapType}
                mapId={effectiveMapId}
                colorScheme={colorScheme}
                options={{
                    scaleControl: showScaleBar,
                    rotateControl: showCompass
                }}
            >
                <ScaleControlManager showScale={showScaleBar} />
                <CompassControlManager showCompass={showCompass} />oogle Maps integration and coordinating map-related functionality including
 * route display, waypoint navigation, and demo mode visualization.
 */

import React, { useEffect } from 'react';
import { Map, ControlPosition, useMap } from '@vis.gl/react-google-maps';
import MapContent from './MapContent';
import { useSettings } from '../../services/SettingsContext.jsx';

/**
 * ScaleControlManager Component
 * 
 * Manages the Google Maps scale control dynamically based on settings
 */
function ScaleControlManager({ showScale }) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        console.log('🔧 ScaleControlManager: Setting scale control to', showScale);
        
        // Set the scale control option on the map
        map.setOptions({ 
            scaleControl: showScale 
        });
        
    }, [map, showScale]);

    return null; // This component doesn't render anything
}

/**
 * CompassControlManager Component
 * 
 * Manages the Google Maps rotate control (compass) dynamically based on settings
 */
function CompassControlManager({ showCompass }) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        console.log('🧭 CompassControlManager: Setting rotate control to', showCompass);
        
        // Set the rotate control option on the map
        map.setOptions({ 
            rotateControl: showCompass,
            gestureHandling: 'greedy', // Allow all gestures including tilt
            rotateControlOptions: {
                position: window.google?.maps?.ControlPosition?.RIGHT_BOTTOM
            }
        });
        
    }, [map, showCompass]);

    return null; // This component doesn't render anything
}

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

    // Determine mapId and colorScheme based on theme setting
    const mapTheme = settings.mapTheme || 'adventuro-earth';
    let effectiveMapId = mapId; // Default Adventuro Earth theme
    let colorScheme = 'LIGHT';

    if (mapTheme === 'gm-light') {
        effectiveMapId = '8a2ac04064bf383366ad6b1e';
        colorScheme = 'LIGHT';
    } else if (mapTheme === 'gm-dark') {
        effectiveMapId = '8a2ac04064bf383366ad6b1e';
        colorScheme = 'DARK';
    }

    // Get scale bar and compass settings
    const showScaleBar = settings.showScaleBar !== undefined ? settings.showScaleBar : true;
    const showCompass = settings.showCompass !== undefined ? settings.showCompass : true;
    console.log('🎨 MainMap using theme:', mapTheme, 'mapId:', effectiveMapId, 'colorScheme:', colorScheme);
    console.log('📏 MainMap showScaleBar:', showScaleBar);
    console.log('🧭 MainMap showCompass:', showCompass);
    console.log('🔍 Settings object:', settings);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Map
                defaultZoom={zoomLevel}
                defaultCenter={{ lat: 30, lng: 0 }}
                mapTypeId={mapType}
                mapId={effectiveMapId}
                colorScheme={colorScheme}
                options={{
                    scaleControl: showScaleBar,
                    rotateControl: showCompass
                }}
            >
                <ScaleControlManager showScale={showScaleBar} />
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