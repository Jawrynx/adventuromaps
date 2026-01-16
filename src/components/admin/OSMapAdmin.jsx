/**
 * OSMapAdmin.jsx - OS Maps implementation for Admin interface
 * 
 * Provides OS Maps integration using Leaflet with drawing capabilities
 */

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polyline as LeafletPolyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import proj4 from 'proj4';
import 'proj4leaflet';
import 'leaflet/dist/leaflet.css';
import './css/OSMapAdmin.css';

// Define EPSG:27700 (British National Grid) projection
proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs');

// Create custom CRS for EPSG:27700
const crs27700 = new L.Proj.CRS('EPSG:27700', proj4.defs('EPSG:27700'), {
    resolutions: [896.0, 448.0, 224.0, 112.0, 56.0, 28.0, 14.0, 7.0, 3.5, 1.75, 0.875, 0.4375, 0.21875, 0.109375],
    origin: [-238375.0, 1376256.0]
});

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * DrawingHandler Component
 * Handles map click events for route drawing
 */
function DrawingHandler({ isDrawing, onAddPoint, onComplete, onMouseMove }) {
    const map = useMapEvents({
        click: (e) => {
            if (isDrawing) {
                const { lat, lng } = e.latlng;
                onAddPoint({ lat, lng });
            }
        },
        dblclick: (e) => {
            if (isDrawing) {
                onComplete();
            }
        },
        mousemove: (e) => {
            if (isDrawing) {
                const { lat, lng } = e.latlng;
                onMouseMove({ lat, lng });
            }
        }
    });

    return null;
}

/**
 * Route Display Component
 * Renders completed routes on the map
 */
function RouteDisplay({ routes }) {
    return (
        <>
            {routes.map(route => (
                <React.Fragment key={route.id}>
                    <LeafletPolyline
                        positions={route.coordinates.map(coord => [coord.lat, coord.lng])}
                        pathOptions={{
                            color: '#0000FF',
                            weight: 4,
                            opacity: 0.7
                        }}
                    />
                    {/* Render waypoint markers */}
                    {route.waypoints && route.waypoints.map((waypoint, idx) => {
                        const L = window.L;
                        if (L) {
                            const marker = L.marker([waypoint.lat, waypoint.lng]);
                            return null; // Markers handled separately if needed
                        }
                        return null;
                    })}
                </React.Fragment>
            ))}
        </>
    );
}

/**
 * MapCenterController Component
 * Forces map to center on UK when component mounts and exposes map ref
 */
function MapCenterController({ mapRef }) {
    const map = useMap();
    
    useEffect(() => {
        // Center on Britain when component mounts
        map.setView([52.5, -1.5], 7);
        
        // Expose map instance to parent via ref
        if (mapRef) {
            mapRef.current = map;
        }
    }, [map, mapRef]);
    
    return null;
}

/**
 * OSMapAdmin Component
 * Main OS Maps implementation for admin interface
 */
function OSMapAdmin({ mapRef, isDrawing, tempPath, mousePosition, routes, onAddPoint, onComplete, onMouseMove }) {
    const OS_API_KEY = '2sTNADGPe2f2TPaVSrqNWzyGGGCcDWFS';
    
    // Default center on UK - centered on England
    const defaultCenter = [52.5, -1.5];
    const defaultZoom = 7;

    // Calculate live path for drawing preview
    const livePath = isDrawing && mousePosition && tempPath.length > 0
        ? [...tempPath, mousePosition]
        : tempPath;

    console.log('OSMapAdmin rendering', { center: defaultCenter, zoom: defaultZoom });

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative' }}>
            <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
                crs={crs27700}
                minZoom={0}
                maxZoom={13}
                key="osmap-container"
            >
                {/* OS Maps Leisure Layer - EPSG:27700 */}
                <TileLayer
                    url={`https://api.os.uk/maps/raster/v1/zxy/Leisure_27700/{z}/{x}/{y}.png?key=${OS_API_KEY}`}
                    attribution='&copy; <a href="http://www.ordnancesurvey.co.uk/">Ordnance Survey</a>'
                    minZoom={0}
                    maxZoom={13}
                />
                
                {/* Force center on UK and expose map ref */}
                <MapCenterController mapRef={mapRef} />

            {/* Drawing Handler */}
            <DrawingHandler
                isDrawing={isDrawing}
                onAddPoint={onAddPoint}
                onComplete={onComplete}
                onMouseMove={onMouseMove}
            />

            {/* Live Drawing Preview */}
            {isDrawing && livePath.length > 1 && (
                <LeafletPolyline
                    positions={livePath.map(point => [point.lat, point.lng])}
                    pathOptions={{
                        color: '#FF0000',
                        weight: 4,
                        opacity: 0.8
                    }}
                />
            )}

            {/* Display Completed Routes */}
            <RouteDisplay routes={routes} />
        </MapContainer>
        </div>
    )};

export default OSMapAdmin;
