import React from 'react';
import { Map, AdvancedMarker, Pin, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { Polyline } from './Polyline';

function MainMap({ activeRoute, mapId, zoomLevel }) {
  const geometryLibrary = useMapsLibrary('geometry');
  const map = useMap();
  const [path, setPath] = React.useState(null);

  React.useEffect(() => {
    if (!activeRoute || !geometryLibrary) {
      setPath(null);
      return;
    }

    if (typeof activeRoute === 'string' && activeRoute.startsWith('enc:')) {
      const encodedString = activeRoute.substring(4);
      const decodedPath = geometryLibrary.encoding.decodePath(encodedString);
      setPath(decodedPath.map(latLng => ({ lat: latLng.lat(), lng: latLng.lng() })));
    } else if (Array.isArray(activeRoute)) {
      setPath(activeRoute);
    } else {
      setPath(null);
    }
  }, [activeRoute, geometryLibrary]);

  React.useEffect(() => {
    if (!map) return;

    if (!path || path.length === 0) {
      if (zoomLevel) {
        map.setZoom(zoomLevel);
      }
      map.setCenter({ lat: 30, lng: 0 });
      return;
    }

    const bounds = new window.google.maps.LatLngBounds();
    path.forEach(point => bounds.extend(point));

    map.fitBounds(bounds, {
      top: 100,
      right: 500,
      bottom: 100,
      left: 100
    });
  }, [map, path, zoomLevel]);

  // Conditional rendering based on whether a path exists
  if (!path) {
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <Map defaultZoom={3} defaultCenter={{ lat: 30, lng: 0 }} mapId={mapId} />
      </div>
    );
  }

  const firstPoint = path[0];
  const lastPoint = path[path.length - 1];

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Map mapId={mapId}>
        <Polyline
          path={path}
          strokeColor="#FF0000"
          strokeOpacity={0.8}
          strokeWeight={4}
        />

        {firstPoint && (
          <AdvancedMarker position={firstPoint}>
            <Pin background={'#00FF00'} glyphColor={'#FFF'} borderColor={'#00FF00'} />
          </AdvancedMarker>
        )}
        {lastPoint && (
          <AdvancedMarker position={lastPoint}>
            <Pin background={'#FF0000'} glyphColor={'#FFF'} borderColor={'#FF0000'} />
          </AdvancedMarker>
        )}
      </Map>
    </div>
  );
}

export default MainMap;