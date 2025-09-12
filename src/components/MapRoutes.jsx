import React from 'react';
import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Polyline } from './Polyline';

function MapRoutes({ routes }) {
    return (
        <>
            {routes.map((route) => {
                const startPoint = route.path[0];
                const endPoint = route.path[route.path.length - 1];

                return (
                    <React.Fragment key={route.id}>
                        <Polyline
                            path={route.path}
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