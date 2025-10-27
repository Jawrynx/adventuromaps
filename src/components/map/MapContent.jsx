/**
 * MapContent.jsx - Map content renderer and interaction controller
 * 
 * This component handles the rendering of map content including routes, waypoints,
 * markers, and boundaries. It also manages smooth panning animations, zoom controls,
 * and the integration of geographic boundary overlays for national parks and
 * areas of outstanding natural beauty.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Polyline } from './Polyline';

/**
 * MapContent Component
 * 
 * Renders and manages interactive map content including:
 * - Route polylines and demo path visualization
 * - Waypoint markers with custom styling
 * - Geographic boundary overlays (National Parks, AONBs)
 * - Smooth panning animations between waypoints
 * - Zoom level management and map bounds calculation
 * - GeoJSON data loading and boundary display
 * 
 * @param {Array|null} activeRoute - Currently selected route coordinates
 * @param {Array|null} activePathForDemo - Demo mode path coordinates
 * @param {Array} waypoints - Array of waypoint objects for navigation
 * @param {Object|null} activeWaypoint - Currently focused waypoint in demo mode
 * @param {number} zoomLevel - Current map zoom level
 * @param {boolean} isZooming - Whether map is currently animating zoom
 * @param {Function} onSmoothPanReady - Callback when smooth pan function is ready
 * @returns {JSX.Element} Map content with routes, markers, and boundaries
 */
function MapContent({ activeRoute, activePathForDemo, waypoints, activeWaypoint, zoomLevel, isZooming, onSmoothPanReady }) {
    // ========== MAP REFERENCES ==========
    const map = useMap();                        // Google Maps instance reference
    const mapsLib = useMapsLibrary('maps');      // Google Maps library for advanced features

    // ========== COMPONENT STATE ==========
    const [path, setPath] = useState(null);             // Current route path data
    const [showBoundaries, setShowBoundaries] = useState(false); // Toggle for boundary overlays

    // ========== SMOOTH PANNING CONFIGURATION ==========
    let panPath = [];      // Array storing smooth pan animation steps
    let panQueue = [];     // Queue for pending pan operations
    const STEPS = 20;      // Number of steps for smooth pan animation
    
    /**
     * Smoothly pans the map to a new location with animation
     * 
     * Creates a smooth panning animation by dividing the movement into
     * multiple steps. Handles queuing of multiple pan requests to prevent
     * animation conflicts and ensures smooth user experience.
     * 
     * @param {google.maps.Map} map - Google Maps instance
     * @param {number} newLat - Target latitude coordinate
     * @param {number} newLng - Target longitude coordinate
     * @param {number} targetZoom - Target zoom level for the destination
     */
    const smoothPanTo = (map, newLat, newLng, targetZoom) => {
        // Queue the request if already panning
        if (panPath.length > 0) {
            panQueue.push([newLat, newLng, targetZoom]);
        } else {
            // Lock panning and calculate smooth animation steps
            panPath.push("LOCK");
            const curLat = map.getCenter().lat();
            const curLng = map.getCenter().lng();
            const dLat = (newLat - curLat) / STEPS;
            const dLng = (newLng - curLng) / STEPS;

            // Create intermediate pan positions for smooth animation
            for (let i = 0; i < STEPS; i++) {
                panPath.push([curLat + dLat * i, curLng + dLng * i]);
            }
            panPath.push([newLat, newLng]);
            panPath.shift();
            // Start the smooth panning animation
            setTimeout(() => doPan(map, targetZoom), 20);
        }
    };

    /**
     * Calculates the transition duration based on distance between waypoints
     * 
     * Determines how long the loading screen should display based on the
     * distance being traveled. Longer distances get longer durations.
     * 
     * @param {number} distanceInMeters - Distance between waypoints in meters
     * @returns {number} Duration in milliseconds for the loading screen
     */
    const calculateTransitionDuration = (distanceInMeters) => {
        if (distanceInMeters < 400) {
            return 500; // Very short distance - 0.5 seconds
        } else if (distanceInMeters < 2000) { // 400m to 2km
            return 3200; // 3.2 seconds
        } else if (distanceInMeters < 8000) { // 2km to 8km
            return 3500; // 3.5 seconds
        } else if (distanceInMeters < 20000) { // 8km to 20km
            return 4000; // 4 seconds
        } else if (distanceInMeters < 40000) { // 20km to 40km
            return 4000; // 4 seconds
        } else if (distanceInMeters < 60000) { // 40km to 60km
            return 4500; // 4.5 seconds
        } else if (distanceInMeters < 120000) { // 60km to 120km
            return 5500; // 5.5 seconds
        } else if (distanceInMeters < 180000) { // 120km to 180km
            return 6000; // 6 seconds
        } else if (distanceInMeters < 250000) { // 180km to 250km
            return 7000; // 7 seconds
        } else if (distanceInMeters < 350000) { // 250km to 350km
            return 7000; // 7 seconds
        } else if (distanceInMeters < 500000) { // 350km to 500km
            return 7500; // 7.5 seconds
        } else if (distanceInMeters < 750000) { // 500km to 750km
            return 7500; // 7.5 seconds
        } else if (distanceInMeters < 1000000) { // 750km to 1000km
            return 7750; // 7.75 seconds
        } else {
            // For distances > 1000km
            return 9000; // 9 seconds
        }
    };

    /**
     * Calculates the distance between two coordinates in meters using Haversine formula
     * 
     * @param {number} lat1 - Start latitude
     * @param {number} lng1 - Start longitude
     * @param {number} lat2 - End latitude
     * @param {number} lng2 - End longitude
     * @returns {number} Distance in meters
     */
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    /**
     * Creates a cinematic panning effect with zoom animation
     * 
     * Provides a more dramatic panning experience by zooming out, panning
     * to the destination, and then zooming back in. Creates a bird's-eye
     * view effect for long-distance navigation.
     * 
     * @param {google.maps.Map} map - Google Maps instance
     * @param {number} newLat - Target latitude coordinate
     * @param {number} newLng - Target longitude coordinate
     * @param {number} targetZoom - Final zoom level after panning
     * @param {Function} onTransitionInfo - Callback with distance and duration info
     */
    const cinematicPanTo = (map, newLat, newLng, targetZoom, onTransitionInfo) => {
        const currentZoom = map.getZoom();
        
        // Get current map center
        const startLat = map.getCenter().lat();
        const startLng = map.getCenter().lng();
        
        // Calculate distance between current and target positions
        const distanceInMeters = calculateDistance(startLat, startLng, newLat, newLng);
        
        // Calculate the loading screen duration based on distance
        const transitionDuration = calculateTransitionDuration(distanceInMeters);
        
        // Call the callback with distance and duration information
        if (onTransitionInfo) {
            onTransitionInfo({
                distanceInMeters,
                transitionDuration,
                distanceInKm: (distanceInMeters / 1000).toFixed(2)
            });
        }
        
        // Determine zoom adjustment based on distance
        let zoomAdjustment;
        if (distanceInMeters < 400) {
            zoomAdjustment = 0; // No zoom out for very short distances
        } else if (distanceInMeters < 2000) { // 400m to 2km
            zoomAdjustment = 1;
        } else if (distanceInMeters < 8000) { // 2km to 8km
            zoomAdjustment = 2;
        } else if (distanceInMeters < 20000) { // 8km to 20km
            zoomAdjustment = 3;
        } else if (distanceInMeters < 40000) { // 20km to 40km
            zoomAdjustment = 4;
        } else if (distanceInMeters < 60000) { // 40km to 60km
            zoomAdjustment = 5;
        } else if (distanceInMeters < 120000) { // 60km to 120km
            zoomAdjustment = 6;
        } else if (distanceInMeters < 180000) { // 120km to 180km
            zoomAdjustment = 7;
        } else if (distanceInMeters < 250000) { // 180km to 250km
            zoomAdjustment = 8;
        } else if (distanceInMeters < 350000) { // 250km to 350km
            zoomAdjustment = 9;
        } else if (distanceInMeters < 500000) { // 350km to 500km
            zoomAdjustment = 10;
        } else if (distanceInMeters < 750000) { // 500km to 750km
            zoomAdjustment = 11;
        } else if (distanceInMeters < 1000000) { // 750km to 1000km
            zoomAdjustment = 12;
        } else {
            // For distances > 1000km, cap at maximum zoom adjustment
            zoomAdjustment = 12;
        }
        
        // Calculate intermediate zoom level (zoom out for overview)
        const zoomOutLevel = Math.max(currentZoom - zoomAdjustment, 5);
        
        // Set initial position (startLat and startLng already declared above)
        map.setCenter(new window.google.maps.LatLng(startLat, startLng));
        
        smoothZoom(map, zoomOutLevel, currentZoom, true);
        
        const zoomOutDuration = (currentZoom - zoomOutLevel) * 200 + 200;
        
        setTimeout(() => {
            
            const CINEMATIC_STEPS = 100;
            const STEP_DURATION = 20;
            
            const dLat = (newLat - startLat) / CINEMATIC_STEPS;
            const dLng = (newLng - startLng) / CINEMATIC_STEPS;
            
            
            let step = 0;
            
            const cinematicPanStep = () => {
                if (step < CINEMATIC_STEPS) {
                    const lat = startLat + dLat * step;
                    const lng = startLng + dLng * step;
                    
                    map.setCenter(new window.google.maps.LatLng(lat, lng));
                    step++;
                    setTimeout(cinematicPanStep, STEP_DURATION);
                } else {
                    map.setCenter(new window.google.maps.LatLng(newLat, newLng));
                    setTimeout(() => {
                        smoothZoom(map, targetZoom, zoomOutLevel, false);
                    }, 200);
                }
            };
            
            cinematicPanStep();
        }, zoomOutDuration);
    };

    /**
     * Executes smooth panning animation steps
     * 
     * Recursively processes the pan path array to create smooth animation.
     * Handles queued pan operations and manages zoom adjustments after
     * panning completes. Core function for the smooth pan animation system.
     * 
     * @param {google.maps.Map} map - Google Maps instance
     * @param {number} targetZoom - Target zoom level after panning completes
     */
    const doPan = (map, targetZoom) => {
        // Get next position in the animation sequence
        const next = panPath.shift();
        if (next != null) {
            // Continue panning animation
            map.panTo(new window.google.maps.LatLng(next[0], next[1]));
            setTimeout(() => doPan(map, targetZoom), 20);
        } else {
            // Panning complete, check for queued operations
            const queued = panQueue.shift();
            if (queued != null) {
                // Process next queued pan operation
                smoothPanTo(map, queued[0], queued[1], queued[2]);
            } else {
                // Apply target zoom if needed
                const currentMapZoom = map.getZoom();
                if (currentMapZoom < targetZoom) {
                    smoothZoom(map, targetZoom, currentMapZoom);
                }
            }
        }
    };

    /**
     * Creates smooth zoom animations with stepped transitions
     * 
     * Provides gradual zoom in/out animations instead of instant zoom changes.
     * Uses event listeners to chain zoom steps for smooth visual transitions
     * and supports both zoom in and zoom out directions.
     * 
     * @param {google.maps.Map} map - Google Maps instance
     * @param {number} targetZoom - Final zoom level to reach
     * @param {number} currentZoom - Current map zoom level
     * @param {boolean} isZoomOut - Whether this is a zoom out operation (affects timing)
     */
    const smoothZoom = (map, targetZoom, currentZoom, isZoomOut = false) => {
        
        if (isZoomOut) {
            // Zoom out animation
            if (currentZoom <= targetZoom) {
                return; // Already at or below target zoom
            } else {
                // Listen for zoom completion before continuing
                const zoomListener = window.google.maps.event.addListener(map, 'zoom_changed', function(event) {
                    window.google.maps.event.removeListener(zoomListener);
                    smoothZoom(map, targetZoom, currentZoom - 1, true);
                });
                setTimeout(() => {
                    map.setZoom(currentZoom - 1);
                }, 200);
            }
        } else {
            // Zoom in animation
            if (currentZoom >= targetZoom) {
                return; // Already at or above target zoom
            } else {
                // Listen for zoom completion before continuing
                const zoomListener = window.google.maps.event.addListener(map, 'zoom_changed', function(event) {
                    window.google.maps.event.removeListener(zoomListener);
                    smoothZoom(map, targetZoom, currentZoom + 1, false);
                });
                setTimeout(() => {
                    map.setZoom(currentZoom + 1);
                }, 300); // Slightly slower timing for zoom in
            }
        }
    };


    // Loads and Styles National Parks GeoJSON
    useEffect(() => {
        if (!map || !mapsLib) {
            return;
        }

        const dataLayer = map.data;
        
        // Clear existing data
        dataLayer.forEach(feature => dataLayer.remove(feature));

        if (showBoundaries) {
            const walesNationalParksGeoJsonUrl = '/geodata/wales-national-parks.json';
            const englandNationalParksGeoJsonUrl = '/geodata/england-national-parks.geojson';
            const englandAONBsGeoJsonUrl = '/geodata/england-aonbs.geojson';
            const scotlandNationalParksGeoJsonUrl = '/geodata/scotland-national-parks.json';

            const styleConfig = {
                fillColor: '#165a01',
                fillOpacity: 0.3,
                strokeColor: '#000000',
                strokeOpacity: 1,
                strokeWeight: 0.2,
            };

            dataLayer.loadGeoJson(walesNationalParksGeoJsonUrl, { idPropertyName: 'id' }, () => {
                dataLayer.setStyle(styleConfig);
            });

            dataLayer.loadGeoJson(englandNationalParksGeoJsonUrl, { idPropertyName: 'id' }, () => {
                dataLayer.setStyle(styleConfig);
            });

            dataLayer.loadGeoJson(englandAONBsGeoJsonUrl, { idPropertyName: 'id' }, () => {
                dataLayer.setStyle(styleConfig);
            });

            dataLayer.loadGeoJson(scotlandNationalParksGeoJsonUrl, { idPropertyName: 'id' }, () => {
                dataLayer.setStyle(styleConfig);
            });
        }

        return () => {
            if (dataLayer) {
                dataLayer.forEach(feature => dataLayer.remove(feature));
            }
        };
    }, [map, mapsLib, showBoundaries]);

    /**
     * Exposes smooth panning functionality to parent components
     * 
     * Creates a callback function that parent components can use to trigger
     * smooth map movements. Supports both standard and cinematic pan modes.
     */
    useEffect(() => {
        if (map && onSmoothPanReady) {
            /**
             * Smooth pan function exposed to parent components
             * 
             * @param {number} lat - Target latitude
             * @param {number} lng - Target longitude  
             * @param {number} zoom - Target zoom level (defaults to current zoomLevel)
             * @param {boolean} useCinematic - Whether to use cinematic panning animation
             * @param {Function} onTransitionInfo - Callback with transition distance and duration info
             */
            const smoothPanFunction = (lat, lng, zoom = zoomLevel, useCinematic = false, onTransitionInfo = null) => {
                if (useCinematic) {
                    cinematicPanTo(map, lat, lng, zoom, onTransitionInfo);
                } else {
                    smoothPanTo(map, lat, lng, zoom);
                }
            };
            onSmoothPanReady(smoothPanFunction);
        }
    }, [map, onSmoothPanReady, zoomLevel]);

    /**
     * Calculate visible waypoints based on active waypoint position
     * 
     * Shows only waypoints that come after the currently active waypoint
     * in the route sequence. This creates a progressive reveal effect
     * as users move through the adventure.
     * 
     * @returns {Array} Array of waypoint objects after the active waypoint
     */
    const visibleWaypoints = useMemo(() => {
        if (!activeWaypoint || !waypoints || waypoints.length === 0) return [];

        // Find index of current active waypoint
        const activeWaypointIndex = waypoints.findIndex(wp => {
            const coords = wp.coordinates || { lat: wp.lat, lng: wp.lng };
            return coords.lat === activeWaypoint?.lat && coords.lng === activeWaypoint?.lng;
        });

        if (activeWaypointIndex === -1) return [];

        // Return all waypoints after the active one
        return waypoints.slice(activeWaypointIndex + 1);
    }, [waypoints, activeWaypoint]);


    useEffect(() => {
        if (!map) return;


        if (activePathForDemo && activePathForDemo.length > 0) {
            setPath(activePathForDemo);
            if (activeWaypoint) {
                if (isZooming) {
                    const currentZoom = map.getZoom();
                    if (currentZoom > 8) {
                        map.setZoom(Math.min(currentZoom, 8));
                        setTimeout(() => {
                            smoothPanTo(map, activeWaypoint.lat, activeWaypoint.lng, zoomLevel);
                        }, 300);
                    } else {
                        smoothPanTo(map, activeWaypoint.lat, activeWaypoint.lng, zoomLevel);
                    }
                    
                    return;
                    
                } else {            
                    if (Math.abs(map.getZoom() - zoomLevel) > 0.1) {
                        map.setZoom(zoomLevel);
                    }
                }
            }
        }
        else if (activeRoute && Array.isArray(activeRoute) && activeRoute.length > 0) {
            setPath(activeRoute);
            const bounds = new window.google.maps.LatLngBounds();
            activeRoute.forEach(point => bounds.extend(point));
            map.fitBounds(bounds, { top: 100, right: 500, bottom: 100, left: 100 });
        }
        else {
            setPath(null);
            map.setZoom(zoomLevel);
            map.setCenter({ lat: 30, lng: 0 });
        }
    }, [activeRoute, activePathForDemo, activeWaypoint, zoomLevel, map, visibleWaypoints, isZooming]);

    return (
        <>
            <div className="map-settings">
                <button 
                    onClick={() => setShowBoundaries(!showBoundaries)}
                    className={`boundaries-toggle ${showBoundaries ? 'active' : ''}`}
                    title={showBoundaries ? 'Hide boundaries' : 'Show boundaries'}
                >
                    {showBoundaries ? '🏞️' : '🗺️'}
                </button>
            </div>
            {Array.isArray(path) && path.length > 0 && (
                <Polyline path={path} strokeColor="#FF0000" strokeOpacity={0.8} strokeWeight={4} />
            )}
            {/* Route start and end markers (for regular routes, not demo mode) */}
            {activeRoute && Array.isArray(activeRoute) && activeRoute.length > 0 && !activeWaypoint && (
                <>
                    <AdvancedMarker position={activeRoute[0]} title="Route Start">
                        <Pin background={'#00FF00'} glyphColor={'#FFF'} borderColor={'#00AA00'} />
                    </AdvancedMarker>
                    <AdvancedMarker position={activeRoute[activeRoute.length - 1]} title="Route End">
                        <Pin background={'#FF4444'} glyphColor={'#FFF'} borderColor={'#CC0000'} />
                    </AdvancedMarker>
                </>
            )}
            {/* Demo mode waypoint markers */}
            {activeWaypoint && (
                <AdvancedMarker position={activeWaypoint}>
                    <Pin background={'#FFA500'} glyphColor={'#FFF'} borderColor={'#FFA500'} />
                </AdvancedMarker>
            )}
            {visibleWaypoints.map((waypoint, index) => {
                const coords = waypoint.coordinates || { lat: waypoint.lat, lng: waypoint.lng };
                return (
                    <AdvancedMarker key={index} position={coords}>
                        <Pin background={'#007BFF'} glyphColor={'#FFF'} borderColor={'#007BFF'} />
                    </AdvancedMarker>
                );
            })}
        </>
    );
}

export default MapContent;