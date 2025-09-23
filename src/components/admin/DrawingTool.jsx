import React, { useState } from 'react';
import { useMap, useMapEvents } from '@vis.gl/react-google-maps';
import { Polyline } from '../map/Polyline';

function DrawingTool({ onPolylineComplete }) {
    const [path, setPath] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const map = useMap();

    useMapEvents({
        click: (e) => {
            if (isDrawing) {
                const newPoint = { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng };
                setPath((prevPath) => [...prevPath, newPoint]);
            }
        },
        dblclick: (e) => {
            if (isDrawing) {
                onPolylineComplete(path);
                setIsDrawing(false);
                setPath([]);
            }
        },
    });

    const startDrawing = () => {
        setIsDrawing(true);
        setPath([]);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        setPath([]);
    };

    return (
        <>
            <div className="drawing-tool">
                {!isDrawing ? (
                    <button onClick={startDrawing}>Start Drawing</button>
                ) : (
                    <button onClick={stopDrawing}>Stop Drawing</button>
                )}
            </div>

            {isDrawing && path.length > 0 && (
                <Polyline
                    path={path}
                    strokeColor="#FF0000"
                    strokeOpacity={0.8}
                    strokeWeight={4}
                />
            )}
        </>
    );
}

export default DrawingTool;