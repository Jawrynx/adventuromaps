/**
 * Admin.jsx - Main administrative interface for creating and managing routes
 * 
 * This component provides a comprehensive admin interface that allows administrators to:
 * - Create interactive routes by drawing on the map
 * - Manage waypoints and route data
 * - Save and publish exploration/adventure content
 * - Provide real-time visual feedback during route creation
 */

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Map, useMap } from '@vis.gl/react-google-maps';

/**
 * ScaleControlManager Component for Admin
 * 
 * Manages the Google Maps scale control dynamically based on settings
 */
function ScaleControlManager({ showScale }) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        console.log('🔧 Admin ScaleControlManager: Setting scale control to', showScale);
        
        // Set the scale control option on the map
        map.setOptions({ 
            scaleControl: showScale 
        });
        
    }, [map, showScale]);

    return null; // This component doesn't render anything
}

// UI Components
import Modal from '../ui/Modal';
import AdmTools from './AdmTools';
import SuggestionsPortal from './SuggestionsPortal';

// Map Components
import MapRoutes from '../map/MapRoutes';
import { Polyline } from '../map/Polyline';

// Firebase services
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

// Styles
import './css/Admin.css';

// Settings
import { useSettings } from '../../services/SettingsContext.jsx';

/**
 * Admin Component
 * 
 * The main admin interface that combines map interaction with route management tools.
 * Handles real-time route drawing, waypoint creation, and integration with Firebase.
 * 
 * @param {string} mapId - Google Maps ID for map styling and configuration
 * @returns {JSX.Element} The admin interface with interactive map and tools
 */
function Admin({ mapId }) {
    // Google Maps instance hook
    const map = useMap();
    
    // Get settings for reactive updates
    const { settings } = useSettings();
    
    // ========== ROUTE & DRAWING STATE ==========
    const [routes, setRoutes] = useState([]);               // Array of completed routes with waypoints
    const [isDrawing, setIsDrawing] = useState(false);      // Whether user is actively drawing a route
    const [tempPath, setTempPath] = useState([]);           // Temporary path coordinates while drawing
    const [mousePosition, setMousePosition] = useState(null); // Current mouse position for live drawing preview
    
    // ========== ADMIN WORKFLOW STATE ==========
    const [isCreatingItem, setIsCreatingItem] = useState(false);     // Whether item creation modal is open
    const [hasCreatedItemInfo, setHasCreatedItemInfo] = useState(false); // Whether item info has been created

    // ========== SEARCH STATE ==========
    const [searchValue, setSearchValue] = useState('');             // Search input value
    const [suggestions, setSuggestions] = useState([]);             // Array of place suggestions
    const [showSuggestions, setShowSuggestions] = useState(false);  // Whether to show suggestions dropdown
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1); // For keyboard navigation
    const [inputPosition, setInputPosition] = useState({ top: 0, left: 0, width: 0 }); // Input position for portal dropdown
    
    // Refs for autocomplete service and search functionality
    const autocompleteServiceRef = useRef(null);
    const searchInputRef = useRef(null);
    
    // Ref to maintain current drawing state across async operations
    const drawingStateRef = useRef({ isDrawing, tempPath });

    /**
     * Synchronizes drawing state with ref for async operations
     * 
     * Updates the ref whenever drawing state changes to ensure
     * map event handlers have access to current state values.
     */
    useEffect(() => {
        drawingStateRef.current.isDrawing = isDrawing;
        drawingStateRef.current.tempPath = tempPath;
    }, [isDrawing, tempPath]);

    /**
     * Initialize Google Places AutocompleteService when Google Maps loads
     */
    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
            autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        }
    }, [map]);

    /**
     * Sets up interactive map event listeners for route drawing
     * 
     * Manages three key interactions:
     * - Click: Adds points to the current route path
     * - Double-click: Completes the route and creates start/end waypoints
     * - Mouse move: Provides live preview of route drawing
     */
    useEffect(() => {
        if (!map) return;
        
        // Handle single clicks to add route points
        const clickListener = map.addListener('click', (e) => {
            const { isDrawing } = drawingStateRef.current;
            if (isDrawing) {
                const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                setTempPath((prevPath) => [...prevPath, newPoint]);
            }
        });

        // Handle double-click to complete route drawing
        const dblClickListener = map.addListener('dblclick', () => {
            const { isDrawing, tempPath } = drawingStateRef.current;
            if (isDrawing && tempPath.length > 1) {
                // Create new route with automatic start/end waypoints
                const newRoute = {
                    id: Date.now(),
                    order: routes.length + 1,
                    coordinates: tempPath,
                    waypoints: [
                        { name: 'Start Point', lat: tempPath[0].lat, lng: tempPath[0].lng, order: 1 },
                        { name: 'End Point', lat: tempPath[tempPath.length - 1].lat, lng: tempPath[tempPath.length - 1].lng, order: 2 }
                    ]
                };
                setRoutes(prevRoutes => [...(prevRoutes || []), newRoute]);
            }
            setIsDrawing(false);
            setTempPath([]);
        });

        // Handle mouse movement for live drawing preview
        const mouseMoveListener = map.addListener('mousemove', (e) => {
            const { isDrawing } = drawingStateRef.current;
            if (isDrawing) {
                setMousePosition({ lat: e.latLng.lat(), lng: e.latLng.lng() });
            }
        });

        // Clean up event listeners on component unmount
        return () => {
            if (window.google && window.google.maps && window.google.maps.event) {
                window.google.maps.event.removeListener(clickListener);
                window.google.maps.event.removeListener(dblClickListener);
                window.google.maps.event.removeListener(mouseMoveListener);
            }
        };
    }, [map]);

    /**
     * Clears all routes from the current session
     * 
     * Removes all drawn routes and resets the route array to empty.
     * Used when starting a new route creation session.
     */
    const handleClearRoutes = () => {
        setRoutes([]);
    };

    /**
     * Removes a specific route by ID
     * 
     * Filters out the specified route from the routes array.
     * 
     * @param {number} routeId - Unique identifier of the route to remove
     */
    const handleRemoveRoute = (routeId) => {
        setRoutes(prevRoutes => prevRoutes.filter(route => route.id !== routeId));
    };

    /**
     * Updates the name of a specific waypoint
     * 
     * Allows editing of waypoint names after route creation.
     * Updates the waypoint name at the specified index within the specified route.
     * 
     * @param {number} routeId - ID of the route containing the waypoint
     * @param {number} waypointIndex - Index of the waypoint within the route
     * @param {string} newName - New name for the waypoint
     */
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

    /**
     * Manually stops route drawing and creates a route from current path
     * 
     * Alternative to double-click completion. Creates a route from the current
     * temporary path if it has enough points, then resets drawing state.
     */
    const handleStopDrawing = () => {
        if (isDrawing && tempPath.length > 1) {
            // Create route with start/end waypoints from current path
            const newRoute = {
                id: Date.now(),
                order: routes.length + 1, 
                coordinates: tempPath,
                waypoints: [
                    { name: 'Start Point', lat: tempPath[0].lat, lng: tempPath[0].lng, order: 1 },
                    { name: 'End Point', lat: tempPath[tempPath.length - 1].lat, lng: tempPath[tempPath.length - 1].lng, order: 2 } 
                ]
            };
            setRoutes(prevRoutes => [...prevRoutes, newRoute]);
        }
        // Reset drawing state
        setIsDrawing(false);
        setTempPath([]);
    };

    /**
     * Saves route and waypoint data to Firestore as draft
     * 
     * Handles the complex process of saving nested route and waypoint data:
     * - Updates existing routes/waypoints or creates new ones
     * - Maintains proper ordering and relationships
     * - Stores Firestore IDs for future updates
     * - Handles the hierarchical structure: item -> routes -> waypoints
     * 
     * @param {Object} itemData - The parent item data (exploration/adventure)
     * @param {string} itemId - Firestore document ID of the parent item
     */
    const handleSaveDraft = async (itemData, itemId) => {
        if (!itemId) {
            console.error("Cannot save routes: No item ID found.");
            alert("Error: No item ID found. Please create an item first.");
            return;
        }

        // Process each route and save to Firestore with proper hierarchy
        const newRoutesWithIds = await Promise.all(
            routes.map(async (route, index) => {
                let routeDocRef;
                let newWaypointsWithIds = [];
                const routeOrder = index + 1;

                // Update existing route or create new one
                if (route.firestoreId) {
                    routeDocRef = doc(db, itemData.type, itemId, 'routes', route.firestoreId);
                    await updateDoc(routeDocRef, {
                        coordinates: route.coordinates,
                        order: routeOrder
                    });
                    console.log("Route document successfully updated with ID:", route.firestoreId);
                } else {
                    const routesCollectionRef = collection(db, itemData.type, itemId, 'routes');
                    routeDocRef = await addDoc(routesCollectionRef, {
                        coordinates: route.coordinates,
                        order: routeOrder 
                    });
                    console.log("New route document successfully written with ID:", routeDocRef.id);
                }

                // Process waypoints for this route
                // Use the correct route ID for the waypoints collection
                const routeIdForWaypoints = route.firestoreId || routeDocRef.id;
                const waypointsCollectionRef = collection(db, itemData.type, itemId, 'routes', routeIdForWaypoints, 'waypoints');
                
                await Promise.all(
                    route.waypoints.map(async (waypoint) => {
                        // Remove firestoreId and sanitize data for Firestore
                        const { firestoreId, ...waypointDataRaw } = waypoint;
                        
                        // Sanitize data: remove undefined values, File objects, and other invalid Firestore data
                        const waypointDataToSave = {};
                        
                        Object.entries(waypointDataRaw).forEach(([key, value]) => {
                            // Skip undefined, null, or internal fields
                            if (value === undefined || value === null || key.startsWith('__') || key === 'id') {
                                return;
                            }
                            
                            // Skip File objects and other complex objects that can't be serialized
                            if (value instanceof File || value instanceof FileList) {
                                console.warn(`Skipping File object in field: ${key}`);
                                return;
                            }
                            
                            // Handle arrays - filter out any File objects or invalid entries
                            if (Array.isArray(value)) {
                                const cleanArray = value.filter(item => 
                                    item !== undefined && 
                                    item !== null && 
                                    !(item instanceof File) && 
                                    !(item instanceof FileList)
                                );
                                // Always include arrays, even if empty, to properly clear fields
                                waypointDataToSave[key] = cleanArray;
                                return;
                            }
                            
                            // For primitive values and valid objects
                            waypointDataToSave[key] = value;
                        });
                        
                        // Debug: Log the data being saved
                        console.log("Saving waypoint data:", waypointDataToSave);
                        
                        if (waypoint.firestoreId) {
                            // Try to update existing waypoint
                            try {
                                const waypointDocRef = doc(waypointsCollectionRef, waypoint.firestoreId);
                                await updateDoc(waypointDocRef, waypointDataToSave);
                                console.log("Waypoint updated:", waypoint.firestoreId);
                                newWaypointsWithIds.push(waypoint);
                            } catch (error) {
                                // If document doesn't exist, create a new one
                                console.log("Waypoint document not found, creating new one:", waypoint.firestoreId, "Error:", error.message);
                                try {
                                    const docRef = await addDoc(waypointsCollectionRef, waypointDataToSave);
                                    console.log("New waypoint created with ID:", docRef.id);
                                    newWaypointsWithIds.push({ ...waypoint, firestoreId: docRef.id });
                                } catch (createError) {
                                    console.error("Failed to create waypoint:", createError.message, "Data:", waypointDataToSave);
                                    throw createError;
                                }
                            }
                        } else {
                            // Create new waypoint
                            try {
                                const docRef = await addDoc(waypointsCollectionRef, waypointDataToSave);
                                console.log("New waypoint added with ID:", docRef.id);
                                newWaypointsWithIds.push({ ...waypoint, firestoreId: docRef.id });
                            } catch (createError) {
                                console.error("Failed to create new waypoint:", createError.message, "Data:", waypointDataToSave);
                                throw createError;
                            }
                        }
                    })
                );

                return { 
                    ...route, 
                    firestoreId: route.firestoreId || routeDocRef.id, 
                    order: routeOrder,
                    waypoints: newWaypointsWithIds 
                };
            })
        );
        
        // Update local state with Firestore IDs for future operations
        setRoutes(newRoutesWithIds);

        alert("Routes and waypoints saved to Firestore successfully! 🎉");
        console.log("All routes and waypoints have been saved.");
    };

    /**
     * Publishes a saved item to make it available to users
     * 
     * Changes the item status from 'draft' to 'published' and adds
     * a publication timestamp. Published items become visible in the
     * Explore and Adventure sections of the app.
     * 
     * @param {Object} itemData - The item data containing type information
     * @param {string} itemId - Firestore document ID of the item to publish
     */
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

    // Calculate live drawing path for visual feedback
    // Includes mouse position as the last point when actively drawing
    const livePath = isDrawing && mousePosition && tempPath.length > 0
        ? [...tempPath, mousePosition]
        : tempPath;



    /**
     * Fetches place suggestions from Google Places AutocompleteService
     * 
     * Called when user types in the search input to provide real-time suggestions.
     */
    const fetchSuggestions = (input) => {
        if (!input.trim() || !autocompleteServiceRef.current) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const request = {
            input: input,
            // No country restrictions - global search enabled
        };

        autocompleteServiceRef.current.getPlacePredictions(request, (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                setSuggestions(predictions);
                setShowSuggestions(true);
                setSelectedSuggestionIndex(-1);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        });
    };

    /**
     * Updates the dropdown position based on input element position
     */
    const updateInputPosition = () => {
        if (searchInputRef.current) {
            const rect = searchInputRef.current.getBoundingClientRect();
            setInputPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width
            });
        }
    };

    /**
     * Handles search input changes and triggers suggestion fetching
     */
    const handleSearchInputChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        
        // Update dropdown position
        updateInputPosition();
        
        // Debounce the API calls
        const timeoutId = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    /**
     * Determines appropriate zoom level based on place types
     * 
     * @param {Array} types - Array of Google Places types
     * @returns {number} Appropriate zoom level
     */
    const getZoomLevelForPlaceType = (types) => {
        if (!types || types.length === 0) return 10;
        
        // Country level
        if (types.includes('country')) return 6;
        
        // State/Province level
        if (types.includes('administrative_area_level_1')) return 7;
        
        // City level
        if (types.includes('locality') || types.includes('administrative_area_level_2')) return 10;
        
        // Neighborhood/suburb level
        if (types.includes('sublocality') || types.includes('neighborhood')) return 14;
        
        // Street/establishment level
        if (types.includes('establishment') || types.includes('point_of_interest') || 
            types.includes('street_address') || types.includes('premise')) return 16;
        
        // Default for other types
        return 10;
    };

    /**
     * Handles selection of a suggestion from the dropdown
     */
    const handleSuggestionSelect = (placeId, description) => {
        setSearchValue(description);
        setShowSuggestions(false);
        
        // Use PlacesService to get place details and location
        const service = new window.google.maps.places.PlacesService(map);
        
        service.getDetails({
            placeId: placeId,
            fields: ['geometry', 'formatted_address', 'types']
        }, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
                const location = place.geometry.location;
                const lat = location.lat();
                const lng = location.lng();
                
                // Determine appropriate zoom level based on place type
                const zoomLevel = getZoomLevelForPlaceType(place.types);
                
                // Center the map on the selected location with adaptive zoom
                if (map) {
                    map.setCenter({ lat, lng });
                    map.setZoom(zoomLevel);
                }
                
                console.log(`Location selected: ${place.formatted_address} at ${lat}, ${lng}`, 
                           `Types: ${place.types?.join(', ')}`, `Zoom: ${zoomLevel}`);
            }
        });
    };

    /**
     * Handles keyboard navigation in the search input and suggestions
     */
    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                // Select the highlighted suggestion
                const suggestion = suggestions[selectedSuggestionIndex];
                handleSuggestionSelect(suggestion.place_id, suggestion.description);
            } else if (searchValue.trim()) {
                // If no suggestion selected, hide suggestions and keep current input
                setShowSuggestions(false);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => 
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
            setSelectedSuggestionIndex(-1);
        }
    };

    /**
     * Handles clicking outside the search to close suggestions
     */
    const handleSearchBlur = () => {
        // Delay hiding suggestions to allow click events on suggestions
        setTimeout(() => {
            setShowSuggestions(false);
            setSelectedSuggestionIndex(-1);
        }, 150);
    };

    /**
     * Clears the search input and hides suggestions
     */
    const handleClearSearch = () => {
        setSearchValue('');
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        // Focus back to input after clearing
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    /**
     * Initiates the item creation workflow
     * 
     * Opens the item creation modal and resets the creation state
     * to ensure a clean start for new item creation.
     */
    const handleCreateItem = () => {
        setIsCreatingItem(true);
        setHasCreatedItemInfo(false);
    };

    // Get map type from settings (reactive to changes)
    const mapType = settings.defaultMapType || 'terrain';
    console.log('🗺️ Admin using mapType:', mapType);

    // Determine mapId and colorScheme based on theme setting
    const mapTheme = settings.mapTheme || 'adventuro-earth';
    let effectiveMapId = mapId; // Default Adventuro Earth theme
    let colorScheme = 'LIGHT';

    if (mapTheme === 'gm-light') {
        effectiveMapId = '8a2ac04064bf383366ad6b1e';
        colorScheme = 'LIGHT';
    } else if (mapTheme === 'gm-dark') {
        effectiveMapId = '8a2ac04064bf383366ad6b1e';
        colorScheme = 'DARK';
    }

    // Get scale bar setting
    const showScaleBar = settings.showScaleBar !== undefined ? settings.showScaleBar : true;
    console.log('🎨 Admin using theme:', mapTheme, 'mapId:', effectiveMapId, 'colorScheme:', colorScheme);
    console.log('📏 Admin showScaleBar:', showScaleBar);

    // ========== COMPONENT RENDER ==========
    return (
        <div style={{ height: '100%', width: '100%' }} id='admin-tools'>
            {/* Interactive map with route drawing capabilities */}
            <Map
                mapId={effectiveMapId}
                defaultZoom={3}
                defaultCenter={{ lat: 30, lng: 0 }} // Centered on UK
                clickableIcons={false} // Disable default map icons to prevent interference
                mapTypeId={mapType} // Map type from settings
                colorScheme={colorScheme}
                options={{
                    scaleControl: showScaleBar
                }}
            >
                {/* Live drawing preview - shows path as user draws */}
                {isDrawing && livePath.length > 1 && (
                    <Polyline
                        path={livePath}
                        strokeColor="#FF0000"     // Red color for active drawing
                        strokeOpacity={0.8}
                        strokeWeight={4}
                        clickable={false}
                    />
                )}
                
                {/* Display all completed routes */}
                <MapRoutes routes={routes} />
                <ScaleControlManager showScale={showScaleBar} />
            </Map>
            
            {/* Drawing control buttons */}
            <div className="drawing-tool">
                {!isCreatingItem ? (
                    <button onClick={() => handleCreateItem()} style={{ marginRight: '5px', backgroundColor: 'green' }}>
                        Create Exploration/Adventure
                    </button>
                ) : hasCreatedItemInfo ? (
                    <>
                        {!isDrawing ? (
                            <button onClick={() => setIsDrawing(true)}>Start Drawing</button>
                        ) : (
                            <button onClick={handleStopDrawing}>Stop Drawing</button>
                        )}
                        
                        {/* Location search bar with autocomplete */}
                        <div className="search-container" style={{ 
                            display: 'inline-flex', 
                            alignItems: 'flex-start', 
                            marginLeft: '10px',
                            position: 'relative'
                        }}>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search location..."
                                value={searchValue}
                                onChange={handleSearchInputChange}
                                onKeyDown={handleSearchKeyPress}
                                onBlur={handleSearchBlur}
                                onFocus={() => {
                                    updateInputPosition();
                                    if (searchValue) setShowSuggestions(true);
                                }}
                                style={{
                                    padding: '8px 35px 8px 12px', // Add right padding for clear button
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    minWidth: '250px',
                                    fontSize: '14px',
                                    height: '38px',
                                    color: '#333'
                                }}
                            />
                            
                            {/* Clear button - only show when there's text */}
                            {searchValue && (
                                <button
                                    onClick={handleClearSearch}
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '16px',
                                        color: '#666',
                                        cursor: 'pointer',
                                        padding: '2px 4px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '20px',
                                        height: '20px',
                                        zIndex: 1
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                    type="button" // Prevent form submission
                                    tabIndex={-1} // Keep focus on input
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
            
            {/* Admin tools modal - always visible during admin workflow */}
            <Modal
                isOpen={true}
                onClose={() => {
                    setIsCreatingItem(false);
                    setHasCreatedItemInfo(false);
                }}
            >
                <AdmTools
                    routes={routes}
                    setRoutes={setRoutes}
                    onRemoveRoute={handleRemoveRoute}
                    onUpdateWaypointName={handleUpdateWaypointName}
                    isCreatingItem={isCreatingItem}
                    onSetCreatingItem={(value) => {
                        setIsCreatingItem(value);
                        if (!value) {
                            setHasCreatedItemInfo(false);
                        }
                    }}
                    onClearRoutes={handleClearRoutes}
                    onSaveDraft={handleSaveDraft}
                    onPublish={handlePublish}
                    hasCreatedItemInfo={hasCreatedItemInfo}
                    onHasCreatedItemInfoChange={(value) => {
                        console.log('Setting hasCreatedItemInfo to:', value);
                        setHasCreatedItemInfo(value);
                    }}
                />
            </Modal>
            
            {/* Portal for suggestions dropdown - renders outside modal */}
            <SuggestionsPortal
                isVisible={showSuggestions}
                suggestions={suggestions}
                position={inputPosition}
                selectedIndex={selectedSuggestionIndex}
                onSuggestionSelect={handleSuggestionSelect}
                onSuggestionHover={setSelectedSuggestionIndex}
            />
        </div>
    );
}

export default Admin;