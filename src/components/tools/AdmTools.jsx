import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import WaypointEditor from './WaypointEditor';
import CreateItemForm from './CreateItemForm';
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { uploadFile } from '../../services/uploadService';
import '../features/css/Admin.css';

function AdmTools({ routes, setRoutes, onRemoveRoute, onUpdateWaypointName, isCreatingItem, onSetCreatingItem, onClearRoutes, onSaveDraft, onPublish }) {
    const [editingWaypoint, setEditingWaypoint] = useState(null);
    const [hasCreatedItemInfo, setHasCreatedItemInfo] = useState(false);
    const [itemData, setItemData] = useState(null);
    const [itemId, setItemId] = useState(null);
    const [loadingItems, setLoadingItems] = useState(false);
    const [itemsToLoad, setItemsToLoad] = useState([]);
    const [showLoadDropdown, setShowLoadDropdown] = useState(false);

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

    const handleCreateItemComplete = ({ id, ...data }) => {
        setItemId(id);
        setItemData(data);
        setHasCreatedItemInfo(true);
        console.log("Initial item data created with ID:", id);
    };

    const handleUpdateWaypoint = async (routeId, waypointIndex, newWaypointData) => {
        let updatedWaypointData = { ...newWaypointData };
        let imageUrls = [];

        try {
            if (updatedWaypointData.images && updatedWaypointData.images.length > 0) {
                for (const file of updatedWaypointData.images) {
                    const imagePath = `images/${routeId}_waypoint_${waypointIndex}_image_${Date.now()}_${file.name}`;
                    const imageUrl = await uploadFile(file, imagePath);
                    imageUrls.push(imageUrl);
                }
                updatedWaypointData.image_urls = imageUrls;
                delete updatedWaypointData.images;
            }

            if (updatedWaypointData.narration && updatedWaypointData.narration instanceof File) {
                const narrationPath = `audio/${routeId}_waypoint_${waypointIndex}_narration.mp3`;
                const narrationUrl = await uploadFile(updatedWaypointData.narration, narrationPath);
                updatedWaypointData.narration = narrationUrl;
            }

            if (updatedWaypointData.keyframes && updatedWaypointData.keyframes instanceof File) {
                const keyframesPath = `keyframes/${routeId}_waypoint_${waypointIndex}_keyframes.txt`;
                const keyframesUrl = await uploadFile(updatedWaypointData.keyframes, keyframesPath);
                updatedWaypointData.keyframes = keyframesUrl;
            }

        } catch (error) {
            console.error("Failed to upload files:", error);
            return;
        }

        const updatedRoutes = routes.map(route => {
            if (route.id === routeId) {
                const newWaypoints = [...route.waypoints];
                newWaypoints[waypointIndex] = {
                    ...newWaypoints[waypointIndex],
                    ...updatedWaypointData
                };
                return { ...route, waypoints: newWaypoints };
            }
            return route;
        });
        setRoutes(updatedRoutes);
    };

    const fetchDraftItems = async (itemType) => {
        setLoadingItems(true);
        const q = query(collection(db, itemType), where("type", "==", itemType), where("status", "==", "draft"));
        const querySnapshot = await getDocs(q);
        const fetchedItems = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setItemsToLoad(fetchedItems);
        setLoadingItems(false);
    };

    const handleLoadItems = (itemType) => {
        setItemsToLoad([]);
        onSetCreatingItem(true);
        setHasCreatedItemInfo(false);
        fetchDraftItems(itemType);
    };

    const handleSelectItemToLoad = (item) => {
        setItemId(item.id);
        setItemData(item);
        setRoutes(item.routes || []);
        setHasCreatedItemInfo(true);
        setItemsToLoad([]);
        // Added to close the main load menu
        onSetCreatingItem(true);
    };

    const handleCancelCreation = () => {
        onSetCreatingItem(false);
        setHasCreatedItemInfo(false);
        setItemData(null);
        setItemId(null);
        setItemsToLoad([]);
    };

    const handleSaveButtonClick = () => {
        if (!itemData || !itemId) {
            alert("Please create or load an item first.");
            return;
        }
        onSaveDraft(itemData, itemId);
    };

    const handlePublishButtonClick = () => {
        if (!itemData || !itemId) {
            alert("Please create or load an item first.");
            return;
        }
        onPublish(itemData, itemId);
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
                            <h3 style={{ margin: '5px 0', backgroundColor: '#444', width: 'fit-content', alignSelf: 'center', padding: '10px', borderRadius: '10px' }}>
                                - {itemData.type === 'exploration' ? 'Exploration' : 'Adventure'} -
                                <br />
                                <span style={{ fontSize: '1.6rem' }}>{itemData.name}</span>
                            </h3>
                            {editingWaypoint ? (
                                <WaypointEditor
                                    waypointData={editingWaypoint}
                                    itemType={itemData.type}
                                    onClose={handleCloseEditor}
                                    onSave={handleUpdateWaypoint}
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
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {routes && Array.isArray(routes) && routes.map((route) => (
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
                                        <button className="adm-button green" onClick={handleSaveButtonClick}>Save Draft</button>
                                        <button className="adm-button red" onClick={onClearRoutes}>Clear Route</button>
                                        <button className="adm-button green" onClick={handlePublishButtonClick}>Publish Route</button>
                                        <div className="load-button-container" style={{ position: 'relative' }}>
                                            <button className="adm-button blue" onClick={() => setShowLoadDropdown(!showLoadDropdown)}>Load Route</button>
                                            {showLoadDropdown && (
                                                <div className="load-dropdown">
                                                    <button onClick={() => { handleLoadItems('exploration'); setShowLoadDropdown(false); }} className='blue'>Load Exploration</button>
                                                    <button onClick={() => { handleLoadItems('adventure'); setShowLoadDropdown(false); }} className='blue'>Load Adventure</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        itemsToLoad.length > 0 ? (
                            <div className="load-items-list">
                                <h3>Select a Draft Item to Load:</h3>
                                {loadingItems ? (
                                    <p>Loading...</p>
                                ) : (
                                    itemsToLoad.map(item => (
                                        <div key={item.id} className="load-item">
                                            <span>{item.name}</span>
                                            <button onClick={() => handleSelectItemToLoad(item)}>LOAD</button>
                                        </div>
                                    ))
                                )}
                                <button className='adm-button blue' onClick={handleCancelCreation}>Cancel</button>
                            </div>
                        ) : (
                            <CreateItemForm
                                onComplete={handleCreateItemComplete}
                                onCancel={handleCancelCreation}
                                saveItem={saveItemToFirestore}
                            />
                        )
                    )}
                </>
            ) : (
                <div className="admin-info">
                    <h1>Get Started</h1>
                    <h2>Create or Load an Item!</h2>
                    <div>
                        <button className='adm-button green' onClick={() => onSetCreatingItem(true)}>Create Exploration/Adventure</button>
                        <button className='adm-button blue' onClick={() => handleLoadItems('exploration')}>Load Exploration</button>
                        <button className='adm-button blue' onClick={() => handleLoadItems('adventure')}>Load Adventure</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdmTools;