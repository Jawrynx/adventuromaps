import React, { useState, useEffect, useRef } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import Modal from '../ui/Modal';
import AdmTools from '../tools/AdmTools';
import MapRoutes from '../map/MapRoutes';
import { Polyline } from '../map/Polyline';
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import './css/Admin.css';

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
                    order: routes.length + 1,  // Add order field based on current number of routes
                    coordinates: tempPath,
                    waypoints: [
                        { name: 'Start Point', lat: tempPath[0].lat, lng: tempPath[0].lng, order: 1 },  // Add order field for start point
                        { name: 'End Point', lat: tempPath[tempPath.length - 1].lat, lng: tempPath[tempPath.length - 1].lng, order: 2 }  // Add order field for end point
                    ]
                };
                setRoutes(prevRoutes => [...(prevRoutes || []), newRoute]);
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
                order: routes.length + 1,  // Add order field based on current number of routes
                coordinates: tempPath,
                waypoints: [
                    { name: 'Start Point', lat: tempPath[0].lat, lng: tempPath[0].lng, order: 1 },  // Add order field for start point
                    { name: 'End Point', lat: tempPath[tempPath.length - 1].lat, lng: tempPath[tempPath.length - 1].lng, order: 2 }  // Add order field for end point
                ]
            };
            setRoutes(prevRoutes => [...prevRoutes, newRoute]);
        }
        setIsDrawing(false);
        setTempPath([]);
    };

    const handleSaveDraft = async (itemData, itemId) => {
        if (!itemId) {
            console.error("Cannot save routes: No item ID found.");
            alert("Error: No item ID found. Please create an item first.");
            return;
        }

        const newRoutesWithIds = await Promise.all(
            routes.map(async (route, index) => {  // Added index parameter
                let routeDocRef;
                let newWaypointsWithIds = [];
                const routeOrder = index + 1;  // Calculate order based on array position

                if (route.firestoreId) {
                    // Route exists, update it
                    routeDocRef = doc(db, itemData.type, itemId, 'routes', route.firestoreId);
                    await updateDoc(routeDocRef, {
                        coordinates: route.coordinates,
                        order: routeOrder  // Update order even for existing routes
                    });
                    console.log("Route document successfully updated with ID:", route.firestoreId);
                } else {
                    // Route is new, add it
                    const routesCollectionRef = collection(db, itemData.type, itemId, 'routes');
                    routeDocRef = await addDoc(routesCollectionRef, {
                        coordinates: route.coordinates,
                        order: routeOrder  // Use the calculated order based on array position
                    });
                    console.log("New route document successfully written with ID:", routeDocRef.id);
                }

                // Handle waypoints for this route
                const waypointsCollectionRef = collection(db, itemData.type, itemId, 'routes', routeDocRef.id, 'waypoints');
                
                await Promise.all(
                    route.waypoints.map(async (waypoint) => {
                        if (waypoint.firestoreId) {
                            // Waypoint exists, update it
                            const waypointDocRef = doc(waypointsCollectionRef, waypoint.firestoreId);
                            await updateDoc(waypointDocRef, { 
                                ...waypoint,
                                order: waypoint.order // Ensure order is included in updates
                            });
                            console.log("Waypoint updated:", waypoint.firestoreId);
                            newWaypointsWithIds.push(waypoint);
                        } else {
                            // Waypoint is new, add it
                            const docRef = await addDoc(waypointsCollectionRef, { 
                                ...waypoint,
                                order: waypoint.order // Ensure order is included for new waypoints
                            });
                            console.log("New waypoint added with ID:", docRef.id);
                            newWaypointsWithIds.push({ ...waypoint, firestoreId: docRef.id });
                        }
                    })
                );

                return { 
                    ...route, 
                    firestoreId: routeDocRef.id, 
                    order: routeOrder,  // Update the order in our local state
                    waypoints: newWaypointsWithIds 
                };
            })
        );
        
        setRoutes(newRoutesWithIds);

        alert("Routes and waypoints saved to Firestore successfully! 🎉");
        console.log("All routes and waypoints have been saved.");
    };

    const handlePublish = async (itemData, itemId) => {
        if (!itemId) {
            alert("Error: No item ID found. Please save a draft first");
            return;
        }

        try {
            const docRef = doc(db, itemData.type, itemId);
            await updateDoc(docRef, {
                status: 'published',
                publishedAt: new Date(),
            });
            console.log(`Item: ${itemId} has been published.`);
            alert(`Item: ${itemId} has been published.`);
        } catch (error) {
            console.error("Error publishing item:", error);
            alert("Error publishing item. Please try again.");
        }
    }

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
                        <button onClick={() => setIsCreatingItem(false)} style={{ margin: '0 5px', backgroundColor: 'red' }}>Clear Explore/Adventure Item</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => handleCreateItem()} style={{ marginRight: '5px', backgroundColor: 'green' }}>Create Exploration/Adventure</button>
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
                    onSaveDraft={handleSaveDraft}
                    onPublish={handlePublish}
                />
            </Modal>
        </div>
    );
}

export default Admin;