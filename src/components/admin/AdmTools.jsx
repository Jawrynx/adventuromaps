import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../ui/LoadingSpinner';

import WaypointEditor from './WaypointEditor';
import CreateItemForm from './CreateItemForm';

import { collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { uploadFile } from '../../services/uploadService';

import './css/Admin.css';

function AdmTools({ routes, setRoutes, onRemoveRoute, onUpdateWaypointName, isCreatingItem, onSetCreatingItem, onClearRoutes, onSaveDraft, onPublish, hasCreatedItemInfo, onHasCreatedItemInfoChange }) {
    const [editingWaypoint, setEditingWaypoint] = useState(null);
    const [itemData, setItemData] = useState(null);
    const [itemId, setItemId] = useState(null);
    const [loadingItems, setLoadingItems] = useState(false);
    const [itemsToLoad, setItemsToLoad] = useState([]);
    const [showLoadDropdown, setShowLoadDropdown] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const dropdownRef = useRef(null);

    const saveItemToFirestore = async (data) => {
        const collectionName = data.type === 'exploration' ? 'exploration' : 'adventure';
        try {
            // Handle image upload if there's a file
            let imageUrl = data.image_url;
            if (data.imageFile) {
                const timestamp = Date.now();
                const imagePath = `images/${collectionName}/${timestamp}_${data.imageFile.name}`;
                imageUrl = await uploadFile(data.imageFile, imagePath);
            }

            // Remove the imageFile from data before saving to Firestore
            const { imageFile, ...dataToSave } = data;

            const docRef = await addDoc(collection(db, collectionName), {
                ...dataToSave,
                image_url: imageUrl,
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
        onHasCreatedItemInfoChange(true);
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
        try {
            console.log('Fetching draft items of type:', itemType);
            const q = query(collection(db, itemType), where("type", "==", itemType), where("status", "==", "draft"));
            const querySnapshot = await getDocs(q);

            const fetchedItems = [];
            for (const doc of querySnapshot.docs) {
                try {
                    const data = doc.data();
                    console.log(`Processing item ${doc.id}:`, data);

                    const routesCollection = collection(db, itemType, doc.id, 'routes');
                    const routesSnapshot = await getDocs(routesCollection);

                    const routes = [];
                    for (const routeDoc of routesSnapshot.docs) {
                        try {
                            const routeData = routeDoc.data();

                            const waypointsCollection = collection(db, itemType, doc.id, 'routes', routeDoc.id, 'waypoints');
                            const waypointsSnapshot = await getDocs(waypointsCollection);
                            const waypoints = waypointsSnapshot.docs.map(wp => ({
                                id: wp.id,
                                ...wp.data()
                            }));

                            routes.push({
                                id: routeDoc.id,
                                ...routeData,
                                waypoints: waypoints || []
                            });
                        } catch (routeError) {
                            console.error(`Error processing route ${routeDoc.id}:`, routeError);
                        }
                    }

                    const itemWithRoutes = {
                        id: doc.id,
                        ...data,
                        routes: routes || []
                    };
                    console.log('Processed item with routes:', itemWithRoutes);
                    fetchedItems.push(itemWithRoutes);
                } catch (itemError) {
                    console.error(`Error processing item ${doc.id}:`, itemError);
                }
            }

            console.log('All fetched items:', fetchedItems);
            setItemsToLoad(fetchedItems);
        } catch (error) {
            console.error('Error in fetchDraftItems:', error);
        } finally {
            setLoadingItems(false);
        }
    };

    const handleLoadItems = (itemType) => {
        setItemsToLoad([]);
        onSetCreatingItem(true);
        onHasCreatedItemInfoChange(false);
        setLoadingItems(true);
        fetchDraftItems(itemType);
    };

    const handleSelectItemToLoad = (item) => {
        console.log('Loading item:', item);
        console.log('Routes in loaded item:', item.routes);

        if (!item.routes || item.routes.length === 0) {
            console.warn('No routes found in loaded item');
        }

        const routesToSet = (item.routes || []).map(route => ({
            ...route,
            waypoints: route.waypoints || []
        }));

        console.log('Structured routes being set:', routesToSet);

        setItemId(item.id);
        setItemData(item);
        setRoutes(routesToSet);
        setItemsToLoad([]);
        onSetCreatingItem(true);
        onHasCreatedItemInfoChange(true);
    };

    const handleCancelCreation = () => {
        onSetCreatingItem(false);
        onHasCreatedItemInfoChange(false);
        setItemData(null);
        setItemId(null);
        setItemsToLoad([]);
        setEditingItem(null);
    };

    const handleEditItem = (item) => {
        console.log('Editing item:', item);
        setItemId(item.id);
        setItemData(item);
        setRoutes(item.routes || []);
        setEditingItem(item);
        setItemsToLoad([]);
        onSetCreatingItem(true);
        onHasCreatedItemInfoChange(false);
    };

    const handleEditComplete = async (updatedData, shouldLoad = false) => {
        try {
            // Handle image upload if there's a file
            let imageUrl = updatedData.image_url;
            if (updatedData.imageFile) {
                const timestamp = Date.now();
                const imagePath = `images/${updatedData.type}/${timestamp}_${updatedData.imageFile.name}`;
                imageUrl = await uploadFile(updatedData.imageFile, imagePath);
            }

            // Remove the imageFile from data before saving to Firestore
            const { imageFile, ...dataToSave } = updatedData;

            const docRef = doc(db, updatedData.type, editingItem.id);
            await updateDoc(docRef, {
                ...dataToSave,
                image_url: imageUrl,
                updatedAt: new Date()
            });

            setItemsToLoad(prevItems =>
                prevItems.map(item =>
                    item.id === editingItem.id ? { ...item, ...updatedData } : item
                )
            );

            setEditingItem(null);
            alert("Item updated successfully!");

            if (shouldLoad) {
                const updatedItem = {
                    ...editingItem,
                    ...updatedData,
                    routes: editingItem.routes || []
                };
                setItemId(updatedItem.id);
                setItemData(updatedItem);
                setRoutes(updatedItem.routes);
                onHasCreatedItemInfoChange(true);
            } else {
                handleLoadItems(updatedData.type);
            }
        } catch (error) {
            console.error("Error updating item:", error);
            alert("Error updating item. Please try again.");
        }
    };

    const handleSaveButtonClick = () => {
        if (!itemData || !itemId) {
            alert("Please create or load an item first.");
            return;
        }
        const updatedItemData = {
            ...itemData,
            routes: routes
        };
        console.log('Saving draft with data:', updatedItemData);
        onSaveDraft(updatedItemData, itemId);
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
                    {loadingItems ? (
                        <div className='loading-spinner'>
                            <LoadingSpinner />
                        </div>
                    ) : hasCreatedItemInfo ? (
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
                                        <button className="adm-button green" onClick={handlePublishButtonClick}>Publish Route</button>
                                        <button className="adm-button red" onClick={onClearRoutes}>Clear Route</button>
                                        <div className="load-button-container" style={{ position: 'relative' }}>
                                            <button className="adm-button blue" onClick={() => {
                                                setShowLoadDropdown(!showLoadDropdown)

                                                if (dropdownRef.current) {
                                                    dropdownRef.current.classList.toggle('show-dropdown');
                                                }
                                            }
                                            }>Load Route</button>
                                                <div ref={dropdownRef} className="load-dropdown">
                                                    <button onClick={() => { handleLoadItems('exploration'); setShowLoadDropdown(false); }} className='blue'>Load Exploration</button>
                                                    <button onClick={() => { handleLoadItems('adventure'); setShowLoadDropdown(false); }} className='blue'>Load Adventure</button>
                                                </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        editingItem ? (
                            <div>
                                <CreateItemForm
                                    onComplete={handleEditComplete}
                                    onCancel={handleCancelCreation}
                                    initialData={editingItem}
                                    isEditing={true}
                                    saveItem={null}
                                />
                            </div>
                        ) : loadingItems ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>Loading draft items...</p>
                            </div>
                        ) : itemsToLoad.length > 0 ? (
                            <div className="load-items-list">
                                <h3>Select a Draft Item to Load:</h3>
                                {itemsToLoad.map(item => (
                                    <div key={item.id} className="load-item">
                                        <span>{item.name}</span>
                                        <div className="item-buttons">
                                            <button onClick={() => handleSelectItemToLoad(item)} className='blue'>LOAD</button>
                                            <button onClick={() => handleEditItem(item)} className="edit-button">EDIT</button>
                                        </div>
                                    </div>
                                ))}
                                <button className='adm-button blue' onClick={handleCancelCreation}>Cancel</button>
                            </div>
                        ) : !hasCreatedItemInfo ? (
                            <div>
                                <CreateItemForm
                                    onComplete={handleEditComplete}
                                    onCancel={handleCancelCreation}
                                    initialData={editingItem}
                                    isEditing={true}
                                    saveItem={null}
                                />
                            </div>
                        ) : !hasCreatedItemInfo ? (
                            <CreateItemForm
                                onComplete={handleCreateItemComplete}
                                onCancel={handleCancelCreation}
                                saveItem={saveItemToFirestore}
                            />
                        ) : null
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