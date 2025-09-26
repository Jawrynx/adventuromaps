import React, { useState, useEffect, useMemo } from 'react';
import { AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Polyline } from './Polyline';

function MapContent({ activeRoute, activePathForDemo, waypoints, activeWaypoint, zoomLevel }) {
    const map = useMap();
    const mapsLib = useMapsLibrary('maps');

    const [path, setPath] = useState(null);
    const [showBoundaries, setShowBoundaries] = useState(true);


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


    // Calculate visible waypoints based on active waypoint
    const visibleWaypoints = useMemo(() => {
        if (!activeWaypoint || !waypoints || waypoints.length === 0) return [];

        const activeWaypointIndex = waypoints.findIndex(wp => {
            const coords = wp.coordinates || { lat: wp.lat, lng: wp.lng };
            return coords.lat === activeWaypoint?.lat && coords.lng === activeWaypoint?.lng;
        });

        if (activeWaypointIndex === -1) return [];

        return waypoints.slice(activeWaypointIndex + 1);
    }, [waypoints, activeWaypoint]);


    useEffect(() => {
        if (!map) return;

        if (activePathForDemo && activePathForDemo.length > 0) {
            setPath(activePathForDemo);
            if (activeWaypoint) {
                map.setCenter(activeWaypoint);
                map.setZoom(zoomLevel);

                const bounds = new window.google.maps.LatLngBounds();
                bounds.extend(activeWaypoint);
                visibleWaypoints.forEach(wp => {
                    const coords = wp.coordinates || { lat: wp.lat, lng: wp.lng };
                    bounds.extend(coords);
                });

                if (visibleWaypoints.length > 0) {
                    map.fitBounds(bounds, { top: 100, right: 500, bottom: 100, left: 100 });
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
    }, [activeRoute, activePathForDemo, activeWaypoint, zoomLevel, map, visibleWaypoints]);

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