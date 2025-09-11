import React, { useEffect, useState } from 'react';
import { Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import Modal from './Modal';
import AdmTools from './AdmTools';
import '../components/css/Admin.css';


function DrawingTool({ onPolylineComplete }) {
    const map = useMap();
    const drawingLibrary = useMapsLibrary('drawing');
    const [drawingManager, setDrawingManager] = useState(null);

    useEffect(() => {
        if (!drawingLibrary || !map) return;

        const manager = new drawingLibrary.DrawingManager({
            drawingMode: drawingLibrary.OverlayType.POLYLINE,
            drawingControl: true,
            drawingControlOptions: {
                position: window.google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [drawingLibrary.OverlayType.POLYLINE],
            },
            polylineOptions: {
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 4,
                clickable: true,
                editable: true,
            },
        });

        manager.setMap(map);

        window.google.maps.event.addListener(manager, 'overlaycomplete', (event) => {
            if (event.type === window.google.maps.drawing.OverlayType.POLYLINE) {
                const path = event.overlay.getPath().getArray().map(latLng => ({
                    lat: latLng.lat(),
                    lng: latLng.lng(),
                }));
                onPolylineComplete(path);
            }
        });

        setDrawingManager(manager);

        return () => {
            if (drawingManager) {
                drawingManager.setMap(null);
            }
        };
    }, [drawingLibrary, map]);

    return null;
}

function Admin() {
    const [waypoints, setWaypoints] = useState([]);

    const handlePolylineComplete = (path) => {
        console.log('New polyline coordinates:', path);
        alert('Polyline drawn! Check the console for coordinates.');

        const start = path[0];
        const end = path[path.length - 1];

        const newWaypoints = [
            { id: Date.now(), name: 'Start Point', lat: start.lat, lng: start.lng },
            { id: Date.now() + 1, name: 'End Point', lat: end.lat, lng: end.lng },
        ];
        
        setWaypoints(prevWaypoints => [...prevWaypoints, ...newWaypoints]);
        
        console.log('Waypoints:', newWaypoints);
    };

    const handleRemoveWaypoint = (id) => {
        setWaypoints(prevWaypoints => prevWaypoints.filter(wp => wp.id !== id));
    };

    return (
        <div style={{ height: '100%', width: '100%' }} id='admin-tools'>
            <Map
                defaultZoom={12}
                defaultCenter={{ lat: 52.7061, lng: -2.7533 }}
            >
                <DrawingTool onPolylineComplete={handlePolylineComplete} />
            </Map>
            <Modal>
                <AdmTools 
                    waypoints={waypoints} 
                    onRemoveWaypoint={handleRemoveWaypoint} 
                />
            </Modal>
        </div>
    );
}

export default Admin;