import React, { useState, useEffect, useRef } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import Modal from './Modal';
import AdmTools from './AdmTools';
import MapRoutes from './MapRoutes';
import { Polyline } from './Polyline';
import '../components/css/Admin.css';

function Admin({ mapId }) {
    const map = useMap();
    const [routes, setRoutes] = useState([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tempPath, setTempPath] = useState([]);
    const [mousePosition, setMousePosition] = useState(null);
    const [isCreatingItem, setIsCreatingItem] = useState(false);

    const drawingStateRef = useRef({ isDrawing, tempPath });

    useEffect(() => {
        drawingStateRef.current.isDrawing = isDrawing;
        drawingStateRef.current.tempPath = tempPath;
    }, [isDrawing, tempPath]);

    useEffect(() => {
        if (!map) return;

        const clickListener = map.addListener('click', (e) => {
            const { isDrawing } = drawingStateRef.current;
            if (isDrawing) {
                const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                setTempPath((prevPath) => [...prevPath, newPoint]);
            }
        });

        const dblClickListener = map.addListener('dblclick', () => {
            const { isDrawing, tempPath } = drawingStateRef.current;
            if (isDrawing && tempPath.length > 1) {
                const newRoute = {
                    id: Date.now(),
                    coordinates: tempPath,
                    waypoints: [
                        { name: 'Start Point', lat: tempPath[0].lat, lng: tempPath[0].lng },
                        { name: 'End Point', lat: tempPath[tempPath.length - 1].lat, lng: tempPath[tempPath.length - 1].lng }
                    ]
                };
                setRoutes(prevRoutes => [...prevRoutes, newRoute]);
            }
            setIsDrawing(false);
            setTempPath([]);
        });

        const mouseMoveListener = map.addListener('mousemove', (e) => {
            const { isDrawing } = drawingStateRef.current;
            if (isDrawing) {
                setMousePosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            }
        });

        return () => {
            if (window.google && window.google.maps && window.google.maps.event) {
                window.google.maps.event.removeListener(clickListener);
                window.google.maps.event.removeListener(dblClickListener);
                window.google.maps.event.removeListener(mouseMoveListener);
            }
        };
    }, [map]);

    const handleClearRoutes = () => {
        setRoutes([]);
    };

    const handleRemoveRoute = (routeId) => {
        setRoutes(prevRoutes => prevRoutes.filter(route => route.id !== routeId));
    };

    const handleUpdateWaypointName = (routeId, waypointIndex, newName) => {
        setRoutes(prevRoutes =>
            prevRoutes.map(route =>
                route.id === routeId
                    ? {
                        ...route,
                        waypoints: route.waypoints.map((waypoint, index) =>
                            index === waypointIndex ? { ...waypoint, name: newName } : waypoint
                        )
                    }
                    : route
            )
        );
    };

    const handleStopDrawing = () => {
        if (isDrawing && tempPath.length > 1) {
            const newRoute = {
                id: Date.now(),
                coordinates: tempPath,
                waypoints: [
                    { name: 'Start Point', lat: tempPath[0].lat, lng: tempPath[0].lng },
                    { name: 'End Point', lat: tempPath[tempPath.length - 1].lat, lng: tempPath[tempPath.length - 1].lng }
                ]
            };
            setRoutes(prevRoutes => [...prevRoutes, newRoute]);
        }
        setIsDrawing(false);
        setTempPath([]);
    };

    const livePath = isDrawing && mousePosition && tempPath.length > 0
        ? [...tempPath, mousePosition]
        : tempPath;

    const handleCreateItem = () => {
        setIsCreatingItem(true);
    };

    return (
        <div style={{ height: '100%', width: '100%' }} id='admin-tools'>
            <Map
                mapId={mapId}
                defaultZoom={12}
                defaultCenter={{ lat: 52.7061, lng: -2.7533 }}
                clickableIcons={false}
            >
                {isDrawing && livePath.length > 1 && (
                    <Polyline
                        path={livePath}
                        strokeColor="#FF0000"
                        strokeOpacity={0.8}
                        strokeWeight={4}
                        clickable={false}
                    />
                )}
                <MapRoutes routes={routes} />
            </Map>
            <div className="drawing-tool">
                {isCreatingItem ? (
                    <>
                        {!isDrawing ? (
                            <button onClick={() => setIsDrawing(true)}>Start Drawing</button>
                        ) : (
                            <button onClick={handleStopDrawing}>Stop Drawing</button>
                        )}
                        <button onClick={() => setIsCreatingItem(false)} style={{ marginLeft: '10px', backgroundColor: 'red' }}>Clear Explore/Adventure Item</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => handleCreateItem()} style={{ marginRight: '10px', backgroundColor: 'green' }}>Create Exploration/Adventure</button>
                    </>
                )}
            </div>
            <Modal>
                <AdmTools
                    routes={routes}
                    setRoutes={setRoutes}
                    onRemoveRoute={handleRemoveRoute}
                    onUpdateWaypointName={handleUpdateWaypointName}
                    isCreatingItem={isCreatingItem}
                    onSetCreatingItem={setIsCreatingItem}
                    onClearRoutes={handleClearRoutes}
                />
            </Modal>
        </div>
    );
}

export default Admin;