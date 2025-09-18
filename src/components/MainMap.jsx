import React from 'react';
import { Map } from '@vis.gl/react-google-maps';
import MapContent from './MapContent';

function MainMap({ activeRoute, activePathForDemo, waypoints, activeWaypoint, mapId, zoomLevel }) {
  console.log("MainMap Props received:");
  console.log("activeRoute:", activeRoute);
  console.log("activePathForDemo:", activePathForDemo);
  console.log("waypoints:", waypoints);
  console.log("activeWaypoint:", activeWaypoint);
  
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Map
        defaultZoom={zoomLevel}
        defaultCenter={{ lat: 30, lng: 0 }}
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