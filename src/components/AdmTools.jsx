import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import WaypointEditor from './WaypointEditor';
import CreateItemForm from './CreateItemForm';
import { collection, addDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

function AdmTools({ routes, onRemoveRoute, onUpdateWaypointName, isCreatingItem, onSetCreatingItem, onClearRoutes }) {
    const [editingWaypoint, setEditingWaypoint] = useState(null);
    const [hasCreatedItemInfo, setHasCreatedItemInfo] = useState(false);
    const [itemData, setItemData] = useState(null);
    const [itemId, setItemId] = useState(null);

    const handleCreateItemComplete = async (data) => {
        const id = await saveItemToFirestore(data);
        setItemId(id);
        setItemData(data);
        setHasCreatedItemInfo(true);
        console.log("Initial item data created with ID:", id);
    };

    const handleCancelCreation = () => {
        onSetCreatingItem(false);
        setHasCreatedItemInfo(false);
        setItemData(null);
        setItemId(null);
    };

    const saveItemToFirestore = async (data) => {
        const collectionName = data.type === 'exploration' ? 'exploration' : 'adventure';
        try {
            const docRef = await addDoc(collection(db, collectionName), {
                ...data,
                createdAt: new Date(),
                status: 'draft'
            });
            console.log("Document successfully written with ID:", docRef.id, "to collection:", collectionName);
            return docRef.id;
        } catch (e) {
            console.error("Error adding document:", e);
            throw e;
        }
    };
    
    const saveRoutesToFirestore = async () => {
        if (!itemId) {
            console.error("Cannot save routes: No item ID found. Please create an item first.");
            alert("Error: No item ID found. Please create an item first.");
            return;
        }

        console.log("Attempting to save routes for item ID:", itemId);

        try {
            const routesCollectionRef = collection(db, itemData.type, itemId, 'routes');
            
            for (const route of routes) {
                console.log("Saving new route...");

                const routeDocRef = await addDoc(routesCollectionRef, {
                    coordinates: route.coordinates,
                });
                console.log("Route document successfully written with ID:", routeDocRef.id);
    
                const waypointsCollectionRef = collection(db, itemData.type, itemId, 'routes', routeDocRef.id, 'waypoints');
                
                console.log("Saving waypoints for route ID:", routeDocRef.id);
                for (const waypoint of route.waypoints) {
                    await addDoc(waypointsCollectionRef, {
                        ...waypoint,
                        name: waypoint.name,
                    });
                }
                console.log("Waypoints saved for route ID:", routeDocRef.id);
            }
            alert("Routes and waypoints saved to Firestore successfully! 🎉");
            console.log("All routes and waypoints have been saved.");

        } catch (e) {
            console.error("Error saving routes:", e);
            alert("Failed to save routes. See console for details.");
        }
    };

    const handleEditClick = (route, waypointIndex) => {
        setEditingWaypoint({
            routeId: route.id,
            waypointIndex: waypointIndex,
            waypoint: route.waypoints[waypointIndex]
        });
    };

    const handleCloseEditor = () => {
        setEditingWaypoint(null);
    };

    return (
        <div id='admin'>
            <button id='minimize-button' onClick={() => {
                document.getElementById('modal').classList.toggle('minimized');
            }}>_</button>
            <h2>Admin Tools</h2>

            {isCreatingItem ? (
                <>
                    {hasCreatedItemInfo ? (
                        <>
                            <h3 style={{margin: '5px 0', backgroundColor: '#444', width: 'fit-content', alignSelf: 'center', padding: '10px', borderRadius: '10px'}}>
                                - {itemData.type === 'exploration' ? 'Exploration' : 'Adventure'} -
                                <br />
                                <span style={{fontSize: '1.6rem'}}>{itemData.name}</span> 
                            </h3>
                            {editingWaypoint ? (
                                <WaypointEditor
                                    waypointData={editingWaypoint}
                                    itemType={itemData.type}
                                    onClose={handleCloseEditor}
                                />
                            ) : (
                                <>
                                    <div className="waypoints-list">
                                        <h3>Waypoints</h3>
                                        <table className="waypoints-table">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Lat.</th>
                                                    <th>Long.</th>
                                                    <th></th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {routes.map((route) => (
                                                    <React.Fragment key={route.id}>
                                                        <tr className='route-start-row'>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    name="waypoint-name-start"
                                                                    value={route.waypoints[0].name}
                                                                    onChange={(e) => onUpdateWaypointName(route.id, 0, e.target.value)}
                                                                />
                                                            </td>
                                                            <td>{route.waypoints[0].lat.toFixed(6)}</td>
                                                            <td>{route.waypoints[0].lng.toFixed(6)}</td>
                                                            <td rowSpan="1">
                                                                <button
                                                                    className='warning-button red'
                                                                    onClick={() => onRemoveRoute(route.id)}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            </td>
                                                            <td rowSpan="1">
                                                                <button
                                                                    className='info-button blue'
                                                                    onClick={() => handleEditClick(route, 0)}
                                                                >
                                                                    <FontAwesomeIcon icon={faPencil} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                                <input
                                                                    type="text"
                                                                    name="waypoint-name-end"
                                                                    value={route.waypoints[1].name}
                                                                    onChange={(e) => onUpdateWaypointName(route.id, 1, e.target.value)}
                                                                />
                                                            </td>
                                                            <td>{route.waypoints[1].lat.toFixed(6)}</td>
                                                            <td>{route.waypoints[1].lng.toFixed(6)}</td>
                                                            <td rowSpan="1">
                                                                <button
                                                                    className='warning-button red'
                                                                    onClick={() => onRemoveRoute(route.id)}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            </td>
                                                            <td rowSpan="1">
                                                                <button
                                                                    className='info-button blue'
                                                                    onClick={() => handleEditClick(route, 1)}
                                                                >
                                                                    <FontAwesomeIcon icon={faPencil} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </React.Fragment>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="tools-container">
                                        <button className="adm-button green" onClick={saveRoutesToFirestore}>Save Draft</button>
                                        <button className="adm-button red" onClick={onClearRoutes}>Clear Route</button>
                                        <button className="adm-button green">Publish Route</button>
                                        <button className="adm-button blue">Load Route</button>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <CreateItemForm
                            onComplete={handleCreateItemComplete}
                            onCancel={handleCancelCreation}
                            saveItem={saveItemToFirestore}
                        />
                    )}
                </>
            ) : (
                <div className="admin-info">
                    <h1>Get Started</h1>
                    <h2>Create an Item!</h2>
                    <button onClick={() => onSetCreatingItem(true)}>Create Exploration/Adventure</button>
                </div>
            )}
        </div>
    );
}

export default AdmTools;