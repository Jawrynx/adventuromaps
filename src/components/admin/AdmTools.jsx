/**
 * AdmTools.jsx - Administrative tools interface for managing routes and items
 * 
 * This comprehensive admin interface handles:
 * - Item creation and editing (explorations/adventures)
 * - Route and waypoint management
 * - File uploads (images, audio, keyframes)
 * - Draft and published item workflows
 * - Integration with Firestore database operations
 */

import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';

// UI Components
import LoadingSpinner from '../ui/LoadingSpinner';
import WaypointEditor from './WaypointEditor';
import CreateItemForm from './CreateItemForm';

// Firebase services
import { collection, addDoc, query, where, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { uploadFile } from '../../services/uploadService';

// Styles
import './css/Admin.css';

/**
 * AdmTools Component
 * 
 * The main administrative interface that provides tools for:
 * - Creating and editing exploration/adventure items
 * - Managing routes and waypoints with detailed editing capabilities
 * - Handling file uploads and media management
 * - Managing item lifecycle (draft -> published)
 * 
 * @param {Array} routes - Array of route objects with waypoints and coordinates
 * @param {Function} setRoutes - Function to update routes array
 * @param {Function} onRemoveRoute - Handler for removing individual routes
 * @param {Function} onUpdateWaypointName - Handler for updating waypoint names
 * @param {boolean} isCreatingItem - Whether item creation workflow is active
 * @param {Function} onSetCreatingItem - Function to control item creation state
 * @param {Function} onClearRoutes - Handler to clear all routes
 * @param {Function} onSaveDraft - Handler to save item and routes as draft
 * @param {Function} onPublish - Handler to publish item
 * @param {boolean} hasCreatedItemInfo - Whether item info has been created
 * @param {Function} onHasCreatedItemInfoChange - Handler to update item info state
 * @returns {JSX.Element} The admin tools interface
 */
function AdmTools({ routes, setRoutes, onRemoveRoute, onUpdateWaypointName, isCreatingItem, onSetCreatingItem, onClearRoutes, onSaveDraft, onPublish, hasCreatedItemInfo, onHasCreatedItemInfoChange, onCenterMapOverRoutes }) {
    // ========== WAYPOINT EDITING STATE ==========
    const [editingWaypoint, setEditingWaypoint] = useState(null); // Currently editing waypoint data
    
    // ========== ITEM MANAGEMENT STATE ==========
    const [itemData, setItemData] = useState(null);               // Current item data (exploration/adventure)
    const [itemId, setItemId] = useState(null);                   // Firestore document ID of current item
    const [editingItem, setEditingItem] = useState(null);         // Item being edited (vs newly created)
    
    // ========== LOADING & UI STATE ==========
    const [loadingItems, setLoadingItems] = useState(false);      // Whether fetching items from Firestore
    const [itemsToLoad, setItemsToLoad] = useState([]);           // Array of draft items available to load
    const [showLoadDropdown, setShowLoadDropdown] = useState(false); // Load dropdown visibility state

    // Ref for dropdown menu positioning and behavior
    const dropdownRef = useRef(null);

    /**
     * Saves a new item to Firestore with image upload handling
     * 
     * Creates a new exploration or adventure document in Firestore:
     * - Handles image file upload to Firebase Storage if provided
     * - Sets initial status as 'draft'
     * - Returns the generated document ID for further operations
     * 
     * @param {Object} data - Item data including type, name, description, etc.
     * @returns {Promise<string>} - The Firestore document ID of the created item
     */
    const saveItemToFirestore = async (data) => {
        const collectionName = data.type === 'exploration' ? 'exploration' : 'adventure';
        try {
            let imageUrl = data.image_url;
            
            // Upload image file if provided
            if (data.imageFile) {
                const timestamp = Date.now();
                const imagePath = `images/${collectionName}/${timestamp}_${data.imageFile.name}`;
                imageUrl = await uploadFile(data.imageFile, imagePath);
            }

            // Remove imageFile from data before saving to Firestore
            const { imageFile, ...dataToSave } = data;

            // Create new document in appropriate collection
            const docRef = await addDoc(collection(db, collectionName), {
                ...dataToSave,
                image_url: imageUrl,
                createdAt: new Date(),
                status: 'draft'  // All new items start as drafts
            });
            return docRef.id;
        } catch (e) {
            console.error("Error adding document:", e);
            throw e;
        }
    };

    /**
     * Handles completion of item creation process
     * 
     * Called when a new item has been successfully created in Firestore.
     * Updates local state and transitions to the route creation phase.
     * 
     * @param {Object} params - Object containing id and item data
     * @param {string} params.id - Firestore document ID of the created item
     * @param {Object} params.data - The item data (name, description, etc.)
     */
    const handleCreateItemComplete = ({ id, ...data }) => {
        setItemId(id);
        setItemData(data);
        onHasCreatedItemInfoChange(true); // Enable route creation phase
    };

    /**
     * Updates waypoint data with file upload handling
     * 
     * Comprehensive waypoint update that handles:
     * - Multiple image uploads and existing image management
     * - Audio narration file uploads
     * - Keyframe text file uploads for animations
     * - Updates local route state with new waypoint data
     * 
     * @param {number} routeId - ID of the route containing the waypoint
     * @param {number} waypointIndex - Index of waypoint within the route
     * @param {Object} newWaypointData - Updated waypoint data including files
     */
    const handleUpdateWaypoint = async (routeId, waypointIndex, newWaypointData) => {
        let updatedWaypointData = { ...newWaypointData };
        let imageUrls = [];

        try {
            // Handle existing image URLs (preserve previously uploaded images)
            if (updatedWaypointData.existingImageUrls && updatedWaypointData.existingImageUrls.length >= 0) {
                // Use the existingImageUrls array which may have been modified (items removed)
                imageUrls = [...updatedWaypointData.existingImageUrls];
            } else if (updatedWaypointData.image_urls) {
                // Fallback to existing image_urls if existingImageUrls is not provided
                imageUrls = [...updatedWaypointData.image_urls];
            }

            // Upload new image files if provided
            if (updatedWaypointData.images && updatedWaypointData.images.length > 0) {
                for (const file of updatedWaypointData.images) {
                    const imagePath = `images/${routeId}_waypoint_${waypointIndex}_image_${Date.now()}_${file.name}`;
                    const imageUrl = await uploadFile(file, imagePath);
                    imageUrls.push(imageUrl);
                }
            }

            // Update waypoint data with consolidated image URLs
            updatedWaypointData.image_urls = imageUrls;
            delete updatedWaypointData.images;          // Remove file objects
            delete updatedWaypointData.existingImageUrls; // Remove temporary array
            

            // Handle narration audio file upload
            if (updatedWaypointData.narration && updatedWaypointData.narration instanceof File) {
                const narrationPath = `audio/${routeId}_waypoint_${waypointIndex}_narration_${Date.now()}.mp3`;
                const narrationUrl = await uploadFile(updatedWaypointData.narration, narrationPath);
                updatedWaypointData.narration_url = narrationUrl;
                delete updatedWaypointData.narration; // Remove file object
            } else {
                // Remove file object if it exists but preserve existing URL
                delete updatedWaypointData.narration;
            }

            // Handle keyframes text file upload for animations
            if (updatedWaypointData.keyframes && updatedWaypointData.keyframes instanceof File) {
                const keyframesPath = `keyframes/${routeId}_waypoint_${waypointIndex}_keyframes_${Date.now()}.txt`;
                const keyframesUrl = await uploadFile(updatedWaypointData.keyframes, keyframesPath);
                updatedWaypointData.keyframes_url = keyframesUrl;
                delete updatedWaypointData.keyframes; // Remove file object
            } else {
                // Remove file object if it exists but preserve existing URL
                delete updatedWaypointData.keyframes;
            }

        } catch (error) {
            console.error("Failed to upload files:", error);
            throw error;
        }

        // Update the routes array with the modified waypoint
        const updatedRoutes = routes.map(route => {
            if (route.id === routeId) {
                const newWaypoints = [...route.waypoints];
                const originalWaypoint = newWaypoints[waypointIndex];
                
                newWaypoints[waypointIndex] = {
                    ...originalWaypoint,
                    ...updatedWaypointData
                };
                                
                return { ...route, waypoints: newWaypoints };
            }
            return route;
        });
        
        setRoutes(updatedRoutes);
    };

    /**
     * Fetches draft items from Firestore with complete route and waypoint data
     * 
     * Performs a comprehensive fetch operation that:
     * - Queries for draft items of specified type (exploration/adventure)
     * - Recursively fetches all routes and waypoints for each item
     * - Handles the complex Firestore hierarchical structure
     * - Provides error handling for individual items/routes/waypoints
     * 
     * @param {string} itemType - Type of items to fetch ('exploration' or 'adventure')
     */
    const fetchDraftItems = async (itemType) => {
        setLoadingItems(true);
        try {            
            // Query for draft items of the specified type
            const q = query(collection(db, itemType), where("type", "==", itemType), where("status", "==", "draft"));
            const querySnapshot = await getDocs(q);

            const fetchedItems = [];
            
            // Process each item document
            for (const doc of querySnapshot.docs) {
                try {
                    const data = doc.data();

                    // Fetch all routes for this item
                    const routesCollection = collection(db, itemType, doc.id, 'routes');
                    const routesSnapshot = await getDocs(routesCollection);

                    const routes = [];
                    
                    // Process each route and its waypoints
                    for (const routeDoc of routesSnapshot.docs) {
                        try {
                            const routeData = routeDoc.data();

                            // Fetch waypoints for this route
                            const waypointsCollection = collection(db, itemType, doc.id, 'routes', routeDoc.id, 'waypoints');
                            const waypointsSnapshot = await getDocs(waypointsCollection);
                            const waypoints = waypointsSnapshot.docs
                                .map(wp => ({
                                    id: wp.id,
                                    firestoreId: wp.id,  // Preserve Firestore ID for updates
                                    ...wp.data()
                                }))
                                .sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort by order field

                            routes.push({
                                id: routeDoc.id,
                                firestoreId: routeDoc.id,  // Preserve Firestore ID for updates
                                ...routeData,
                                waypoints: waypoints || []
                            });
                        } catch (routeError) {
                            console.error(`Error processing route ${routeDoc.id}:`, routeError);
                        }
                    }

                    // Sort routes by order and combine item data with its routes
                    const sortedRoutes = routes.sort((a, b) => (a.order || 0) - (b.order || 0));
                    
                    const itemWithRoutes = {
                        id: doc.id,
                        ...data,
                        routes: sortedRoutes || []
                    };
                    fetchedItems.push(itemWithRoutes);
                } catch (itemError) {
                    console.error(`Error processing item ${doc.id}:`, itemError);
                }
            }

            setItemsToLoad(fetchedItems);
        } catch (error) {
            console.error('Error in fetchDraftItems:', error);
        } finally {
            setLoadingItems(false);
        }
    };

    /**
     * Initiates the process of loading existing draft items
     * 
     * Starts the workflow for loading previously created draft items
     * and fetches available items from Firestore.
     * 
     * @param {string} itemType - Type of items to load ('exploration' or 'adventure')
     */
    const handleLoadItems = (itemType) => {
        setItemsToLoad([]);                    // Clear any existing items
        onSetCreatingItem(true);               // Enter creation workflow
        onHasCreatedItemInfoChange(false);     // Reset item info state
        setLoadingItems(true);                 // Show loading state
        fetchDraftItems(itemType);             // Fetch items from Firestore
    };

    /**
     * Loads a selected draft item for editing
     * 
     * Takes a selected item and loads all its data (including routes and waypoints)
     * into the current editing session for further modification.
     * 
     * @param {Object} item - The item object containing routes and waypoints
     */
    const handleSelectItemToLoad = (item) => {
        if (!item.routes || item.routes.length === 0) {
            console.warn('No routes found in loaded item');
        }

        // Ensure proper structure for routes and waypoints
        const routesToSet = (item.routes || []).map(route => ({
            ...route,
            waypoints: route.waypoints || []
        }));


        // Load item data into current session
        setItemId(item.id);
        setItemData(item);
        setRoutes(routesToSet);
        setItemsToLoad([]);
        onSetCreatingItem(true);
        onHasCreatedItemInfoChange(true);      // Enable route editing
        
        // Center the map over the loaded routes
        if (onCenterMapOverRoutes && routesToSet.length > 0) {
            // Small delay to ensure routes are rendered before centering
            setTimeout(() => {
                onCenterMapOverRoutes(routesToSet);
            }, 100);
        }
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
        setItemId(item.id);
        setItemData(item);
        
        // Ensure routes have proper local IDs for React state management
        const routesWithLocalIds = (item.routes || []).map(route => ({
            ...route,
            id: route.id || Date.now() + Math.random() // Ensure local ID exists
        }));
        
        setRoutes(routesWithLocalIds);
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
            <h2>Admin Tools</h2>
            {isCreatingItem ? (
                <>
                    {loadingItems ? (
                        <div className='loading-spinner'>
                            <LoadingSpinner />
                        </div>
                    ) : hasCreatedItemInfo ? (
                        <>
                            <h3 style={{ margin: '5px 0', backgroundColor: '#444', width: 'fit-content', alignSelf: 'center', textAlign: 'center', padding: '10px', borderRadius: '10px' }}>
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
                                <div className="main-tools">
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
                                                                    className='waypoint-name'
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
                                                                    className='waypoint-name'
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
                                </div>
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