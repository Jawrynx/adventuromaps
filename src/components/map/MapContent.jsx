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

    // Cinematic pan with zoom out/in effect for DemoView navigation (5 second duration)
    const cinematicPanTo = (map, newLat, newLng, targetZoom) => {
        const currentZoom = map.getZoom();
        
        // Force a more aggressive zoom out - go down by 3 levels minimum
        const zoomOutLevel = Math.max(currentZoom - 3, 5);
        
        // CAPTURE COORDINATES BEFORE ZOOM OUT
        const startLat = map.getCenter().lat();
        const startLng = map.getCenter().lng();
        
        console.log('🎬 CINEMATIC PAN START 🎬');
        console.log('Starting 5-second cinematic pan from', startLat, startLng, 'to', newLat, newLng);
        console.log('Distance to travel:', Math.abs(newLat - startLat), Math.abs(newLng - startLng));
        console.log('Zoom levels: current =', currentZoom, 'zoomOut =', zoomOutLevel, 'target =', targetZoom);
        
        // Phase 1: Smooth zoom out first (visible and gradual)
        console.log('🆕 NEW VERSION - Starting smooth zoom out from', currentZoom, 'to', zoomOutLevel);
        
        // Set the map to the original starting position first
        map.setCenter(new window.google.maps.LatLng(startLat, startLng));
        
        // Start smooth zoom out with new function
        console.log('🔥 CALLING SMOOTH ZOOM OUT WITH NEW FUNCTION');
        smoothZoom(map, zoomOutLevel, currentZoom, true);
        
        // Phase 2: Start pan after zoom out completes (3 zoom levels * 200ms = 600ms)
        const zoomOutDuration = (currentZoom - zoomOutLevel) * 200 + 200; // Add buffer
        
        setTimeout(() => {
            console.log('Zoom out complete, starting fast pan from:', startLat, startLng, 'to', newLat, newLng);
            
            // Faster 1.5-second animation
            const CINEMATIC_STEPS = 30;
            const STEP_DURATION = 50; // 30 steps × 50ms = 1500ms (1.5 seconds)
            
            const dLat = (newLat - startLat) / CINEMATIC_STEPS;
            const dLng = (newLng - startLng) / CINEMATIC_STEPS;
            
            console.log('Delta per step:', dLat, dLng);
            
            let step = 0;
            
            const cinematicPanStep = () => {
                if (step < CINEMATIC_STEPS) {
                    const lat = startLat + dLat * step;
                    const lng = startLng + dLng * step;
                    
                    // Use setCenter for smooth movement
                    map.setCenter(new window.google.maps.LatLng(lat, lng));
                    step++;
                    setTimeout(cinematicPanStep, STEP_DURATION);
                } else {
                    // Phase 3: Final position and zoom back in
                    console.log('Pan complete, starting zoom in from', zoomOutLevel, 'to', targetZoom);
                    map.setCenter(new window.google.maps.LatLng(newLat, newLng));
                    setTimeout(() => {
                        console.log('Starting smoothZoom IN from', zoomOutLevel, 'to', targetZoom);
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
        console.log('smoothZoom called: current =', currentZoom, 'target =', targetZoom, 'isZoomOut =', isZoomOut);
        
        if (isZoomOut) {
            // Zooming out (decreasing zoom level)
            if (currentZoom <= targetZoom) {
                console.log('smoothZoom OUT complete, current zoom reached target');
                return;
            } else {
                console.log('smoothZoom OUT: zooming from', currentZoom, 'to', currentZoom - 1);
                const zoomListener = window.google.maps.event.addListener(map, 'zoom_changed', function(event) {
                    window.google.maps.event.removeListener(zoomListener);
                    smoothZoom(map, targetZoom, currentZoom - 1, true);
                });
                setTimeout(() => {
                    map.setZoom(currentZoom - 1);
                }, 200); // Faster for zoom out
            }
        } else {
            // Zooming in (increasing zoom level)
            if (currentZoom >= targetZoom) {
                console.log('smoothZoom IN complete, current zoom reached target');
                return;
            } else {
                console.log('smoothZoom IN: zooming from', currentZoom, 'to', currentZoom + 1);
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

        console.log('MapContent useEffect triggered with activeWaypoint:', activeWaypoint, 'isZooming:', isZooming, 'activePathForDemo:', activePathForDemo?.length);

        if (activePathForDemo && activePathForDemo.length > 0) {
            setPath(activePathForDemo);
            if (activeWaypoint) {
                if (isZooming) {
                    console.log('MapContent useEffect: Initial demo zoom, using regular smoothPanTo');
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
                    // In demo mode navigation (not initial zooming), DON'T override the cinematic pan
                    console.log('MapContent useEffect: Demo navigation, skipping pan to let cinematic pan handle it');
                    // Don't call map.panTo() or smoothPanTo() during demo navigation
                    // The cinematic pan from MainContent will handle the movement
                    
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