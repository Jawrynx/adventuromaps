import React from 'react';
import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Polyline } from './Polyline';

function MapRoutes({ routes }) {
    // Add a check to ensure 'routes' is an array before trying to map it
    if (!routes || !Array.isArray(routes)) {
        return null; // or return an empty fragment: <></>
    }

    return (
        <>
            {routes.map((route) => {
                // Check if route.coordinates and route.waypoints exist and have the expected structure
                if (!route.coordinates || route.coordinates.length < 2 || !route.waypoints || route.waypoints.length < 2) {
                    // Skip this route if it's invalid
                    console.warn("Skipping an invalid route:", route);
                    return null;
                }
                
                const startPoint = route.coordinates[0];
                const endPoint = route.coordinates[route.coordinates.length - 1];

                return (
                    <React.Fragment key={route.id}>
                        <Polyline
                            path={route.coordinates}
                            strokeColor="#FF0000"
                            strokeOpacity={0.8}
                            strokeWeight={4}
                            clickable={false}
                        />
                        <AdvancedMarker position={startPoint}>
                            <Pin background={'#000000'} borderColor={'#333333'} glyphColor={'#fff'} />
                        </AdvancedMarker>
                        <AdvancedMarker position={startPoint}>
                            <div className="waypoint-label">{route.waypoints[0].name}</div>
                        </AdvancedMarker>

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