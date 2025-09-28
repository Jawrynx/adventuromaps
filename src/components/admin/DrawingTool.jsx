/**
 * DrawingTool.jsx - Interactive map drawing tool component
 * 
 * Provides an alternative drawing interface using React Google Maps events.
 * This component offers a more React-friendly approach to route drawing
 * compared to the direct Google Maps API listeners used in Admin.jsx.
 * 
 * Note: This appears to be an alternative implementation that may not be
 * currently active in the main Admin component.
 */

import React, { useState } from 'react';
import { useMap, useMapEvents } from '@vis.gl/react-google-maps';
import { Polyline } from '../map/Polyline';

/**
 * DrawingTool Component
 * 
 * An interactive drawing tool that allows users to create polyline routes
 * by clicking on the map. Uses React Google Maps event system.
 * 
 * @param {Function} onPolylineComplete - Callback when a polyline is completed
 * @returns {JSX.Element} Drawing interface with start/stop controls
 */
function DrawingTool({ onPolylineComplete }) {
    // ========== DRAWING STATE ==========
    const [path, setPath] = useState([]);           // Array of coordinate points for current path
    const [isDrawing, setIsDrawing] = useState(false); // Whether drawing mode is active
    
    const map = useMap(); // Google Maps instance

    /**
     * Map event handlers using React Google Maps event system
     * 
     * Provides drawing functionality through React-based event handling
     * rather than direct Google Maps API event listeners.
     */
    useMapEvents({
        click: (e) => {
            if (isDrawing) {
                // Add new point to the current drawing path
                const newPoint = { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng };
                setPath((prevPath) => [...prevPath, newPoint]);
            }
        },
        dblclick: (e) => {
            if (isDrawing) {
                // Complete the polyline and reset drawing state
                onPolylineComplete(path);
                setIsDrawing(false);
                setPath([]);
            }
        },
    });

    /**
     * Initiates drawing mode
     * 
     * Enables drawing mode and resets the path array
     * for a fresh drawing session.
     */
    const startDrawing = () => {
        setIsDrawing(true);
        setPath([]);
    };

    /**
     * Stops drawing mode without completing polyline
     * 
     * Cancels current drawing session and clears the path
     * without calling the completion callback.
     */
    const stopDrawing = () => {
        setIsDrawing(false);
        setPath([]);
    };

    // ========== COMPONENT RENDER ==========
    return (
        <>
            {/* Drawing control interface */}
            <div className="drawing-tool">
                {!isDrawing ? (
                    <button onClick={startDrawing}>Start Drawing</button>
                ) : (
                    <button onClick={stopDrawing}>Stop Drawing</button>
                )}
            </div>

            {/* Live polyline preview during drawing */}
            {isDrawing && path.length > 0 && (
                <Polyline
                    path={path}
                    strokeColor="#FF0000"    // Red color for active drawing
                    strokeOpacity={0.8}
                    strokeWeight={4}
                />
            )}
        </>
    );
}

export default DrawingTool;