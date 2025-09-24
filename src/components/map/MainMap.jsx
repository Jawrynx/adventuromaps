import React, { useEffect } from 'react';
import { Map } from '@vis.gl/react-google-maps';
import MapContent from './MapContent';

function MainMap({ activeRoute, activePathForDemo, waypoints, activeWaypoint, mapId, zoomLevel }) {
    console.log("MainMap Props received:");
    console.log("activeRoute:", activeRoute);
    console.log("activePathForDemo:", activePathForDemo);
    console.log("waypoints:", waypoints);
    console.log("activeWaypoint:", activeWaypoint);

    useEffect(() => {
        const disableStreetViewLinks = () => {
            const profileLinks = document.querySelectorAll('.gm-iv-profile-url > a');
            const addressLinks = document.querySelectorAll('.gm-iv-address-link > a');
            const markerLinks = document.querySelectorAll('.gm-iv-marker > a');

            [...profileLinks, ...addressLinks, ...markerLinks].forEach(link => {
                if (link) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    });
                }
            });
        };
        
        setTimeout(disableStreetViewLinks, 1000);

    }, []); 

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Map
                defaultZoom={zoomLevel}
                defaultCenter={{ lat: 30, lng: 0 }}
                mapTypeId={'terrain'}
                mapId={mapId}
            >
                <MapContent 
                    activeRoute={activeRoute} 
                    activePathForDemo={activePathForDemo}
                    waypoints={waypoints}
                    activeWaypoint={activeWaypoint} 
                    zoomLevel={zoomLevel} 
                />
            </Map>
        </div>
    );
}

export default MainMap;