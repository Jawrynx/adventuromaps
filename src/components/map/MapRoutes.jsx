import React from 'react';
import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Polyline } from './Polyline';

/**
 * MapRoutes Component
 * 
 * Renders multiple adventure routes on the Google Maps interface with visual
 * polylines connecting waypoints and markers for start/end points. Provides
 * route visualization for the explore and guides features.
 * 
 * Features:
 * - Displays route paths as colored polylines
 * - Shows start and end markers with custom pins
 * - Renders waypoint labels for route identification
 * - Validates route data before rendering
 * - Handles multiple routes simultaneously
 * 
 * @param {Object} props - Component props
 * @param {Array} props.routes - Array of route objects to display
 * @returns {JSX.Element|null} Rendered route elements or null if no valid routes
 */
function MapRoutes({ routes }) {
    /**
     * Validate routes data structure
     * Ensures routes is an array before attempting to render
     */
    if (!routes || !Array.isArray(routes)) {
        return null; // No valid routes to display
    }

    return (
        <>
            {routes.map((route) => {
                /**
                 * Validate individual route data structure
                 * Ensures route has minimum required coordinates and waypoints
                 * before attempting to render polylines and markers
                 */
                if (!route.coordinates || route.coordinates.length < 2 || !route.waypoints || route.waypoints.length < 2) {
                    console.warn("Skipping an invalid route:", route);
                    return null; // Skip invalid route data
                }
                
                // Extract start and end coordinates from route path
                const startPoint = route.coordinates[0];
                const endPoint = route.coordinates[route.coordinates.length - 1];

                return (
                    <React.Fragment key={route.id}>
                        {/* Route path polyline */}
                        <Polyline
                            path={route.coordinates}
                            strokeColor="#FF0000"
                            strokeOpacity={0.8}
                            strokeWeight={4}
                            clickable={false}
                        />
                        
                        {/* Start point marker and label */}
                        <AdvancedMarker position={startPoint}>
                            <Pin background={'#000000'} borderColor={'#333333'} glyphColor={'#fff'} />
                        </AdvancedMarker>
                        <AdvancedMarker position={startPoint}>
                            <div className="waypoint-label">{route.waypoints[0].name}</div>
                        </AdvancedMarker>

                        {/* End point marker and label */}
                        <AdvancedMarker position={endPoint}>
                            <Pin background={'#000000'} borderColor={'#333333'} glyphColor={'#fff'} />
                        </AdvancedMarker>
                        <AdvancedMarker position={endPoint}>
                            <div className="waypoint-label">{route.waypoints[1].name}</div>
                        </AdvancedMarker>
                    </React.Fragment>
                );
            })}
        </>
    );
}

export default MapRoutes;