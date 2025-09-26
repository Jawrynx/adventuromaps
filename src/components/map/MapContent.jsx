import React, { useState, useEffect, useMemo } from 'react';
import { AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Polyline } from './Polyline';

function MapContent({ activeRoute, activePathForDemo, waypoints, activeWaypoint, zoomLevel, isZooming, onSmoothPanReady }) {
    const map = useMap();
    const mapsLib = useMapsLibrary('maps');

    const [path, setPath] = useState(null);
    const [showBoundaries, setShowBoundaries] = useState(true);

    let panPath = [];
    let panQueue = [];
    const STEPS = 20;
    
    const smoothPanTo = (map, newLat, newLng, targetZoom) => {
        if (panPath.length > 0) {
            panQueue.push([newLat, newLng, targetZoom]);
        } else {
            panPath.push("LOCK");
            const curLat = map.getCenter().lat();
            const curLng = map.getCenter().lng();
            const dLat = (newLat - curLat) / STEPS;
            const dLng = (newLng - curLng) / STEPS;

            for (let i = 0; i < STEPS; i++) {
                panPath.push([curLat + dLat * i, curLng + dLng * i]);
            }
            panPath.push([newLat, newLng]);
            panPath.shift();
            setTimeout(() => doPan(map, targetZoom), 20);
        }
    };

    const cinematicPanTo = (map, newLat, newLng, targetZoom) => {
        const currentZoom = map.getZoom();
        
        const zoomOutLevel = Math.max(currentZoom - 3, 5);
        
        const startLat = map.getCenter().lat();
        const startLng = map.getCenter().lng();
        
        map.setCenter(new window.google.maps.LatLng(startLat, startLng));
        
        smoothZoom(map, zoomOutLevel, currentZoom, true);
        
        const zoomOutDuration = (currentZoom - zoomOutLevel) * 200 + 200;
        
        setTimeout(() => {
            
            const CINEMATIC_STEPS = 30;
            const STEP_DURATION = 50;
            
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
    



    const doPan = (map, targetZoom) => {
        const next = panPath.shift();
        if (next != null) {
            map.panTo(new window.google.maps.LatLng(next[0], next[1]));
            setTimeout(() => doPan(map, targetZoom), 20);
        } else {
            const queued = panQueue.shift();
            if (queued != null) {
                smoothPanTo(map, queued[0], queued[1], queued[2]);
            } else {
                const currentMapZoom = map.getZoom();
                if (currentMapZoom < targetZoom) {
                    smoothZoom(map, targetZoom, currentMapZoom);
                }
            }
        }
    };

    const smoothZoom = (map, targetZoom, currentZoom, isZoomOut = false) => {
        
        if (isZoomOut) {
            if (currentZoom <= targetZoom) {
                return;
            } else {
                const zoomListener = window.google.maps.event.addListener(map, 'zoom_changed', function(event) {
                    window.google.maps.event.removeListener(zoomListener);
                    smoothZoom(map, targetZoom, currentZoom - 1, true);
                });
                setTimeout(() => {
                    map.setZoom(currentZoom - 1);
                }, 200);
            }
        } else {
            if (currentZoom >= targetZoom) {
                return;
            } else {
                const zoomListener = window.google.maps.event.addListener(map, 'zoom_changed', function(event) {
                    window.google.maps.event.removeListener(zoomListener);
                    smoothZoom(map, targetZoom, currentZoom + 1, false);
                });
                setTimeout(() => {
                    map.setZoom(currentZoom + 1);
                }, 280);
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

    // Expose smooth panning function to parent components
    useEffect(() => {
        if (map && onSmoothPanReady) {
            const smoothPanFunction = (lat, lng, zoom = zoomLevel, useCinematic = false) => {
                if (useCinematic) {
                    cinematicPanTo(map, lat, lng, zoom);
                } else {
                    smoothPanTo(map, lat, lng, zoom);
                }
            };
            onSmoothPanReady(smoothPanFunction);
        }
    }, [map, onSmoothPanReady, zoomLevel]);

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