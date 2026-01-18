/**
 * Admin.jsx - Main administrative interface for managing app content
 * 
 * This component provides a comprehensive admin interface that allows administrators to:
 * - View and manage exploration and adventure
 * - View and manage posts (guides) and community posts
 * - View and manage user accounts
 * - Create interactive routes by drawing on the map (when editing items)
 * - Manage waypoints and route data
 * - Save and publish exploration/adventure content
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


        // Set the scale control option on the map
        map.setOptions({
            scaleControl: showScale
        });

    }, [map, showScale]);

    return null; // This component doesn't render anything
}

/**
 * CompassControlManager Component for Admin
 * 
 * Manages the Google Maps rotate control (compass) dynamically based on settings
 */
function CompassControlManager({ showCompass }) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        // Set the rotate control option on the map
        map.setOptions({
            rotateControl: showCompass,
            gestureHandling: 'greedy', // Allow all gestures including tilt
            rotateControlOptions: {
                position: window.google?.maps?.ControlPosition?.RIGHT_BOTTOM
            }
        });

    }, [map, showCompass]);

    return null; // This component doesn't render anything
}

// UI Components
import Modal from '../ui/Modal';
import Notification from '../ui/Notification';
import AlertModal from '../ui/AlertModal';
import AdmTools from './AdmTools';
import SuggestionsPortal from './SuggestionsPortal';
import OSMapAdmin from './OSMapAdmin';
import LoadingSpinner from '../ui/LoadingSpinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUndo, faMap, faHiking, faNewspaper, faUsers, faComments, faArrowLeft, faPlus, faEdit, faTrash, faEye, faSearch} from '@fortawesome/free-solid-svg-icons';

// Map Components
import MapRoutes from '../map/MapRoutes';
import { Polyline } from '../map/Polyline';

// Firebase services
import { collection, addDoc, doc, updateDoc, getDocs, deleteDoc, getDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../services/firebase";

// Styles
import './css/Admin.css';

// Settings
import { useSettings } from '../../services/SettingsContext.jsx';

/**
 * AdminMenu Component
 * 
 * Main admin menu with options to manage different content types
 */
function AdminMenu({ onSelectOption, itemCounts }) {
    const menuOptions = [
        {
            id: 'exploration',
            title: 'Explorations',
            description: 'View and manage exploration items',
            icon: faMap,
            count: itemCounts.exploration,
            color: '#64c8ff'
        },
        {
            id: 'adventure',
            title: 'Adventures',
            description: 'View and manage adventure items',
            icon: faHiking,
            count: itemCounts.adventure,
            color: '#64ff96'
        },
        {
            id: 'guides',
            title: 'Guides (Posts)',
            description: 'View and manage guide posts',
            icon: faNewspaper,
            count: itemCounts.guides,
            color: '#ffa864'
        },
        {
            id: 'community_posts',
            title: 'Community Posts',
            description: 'View and manage community posts',
            icon: faComments,
            count: itemCounts.communityPosts,
            color: '#ff64c8'
        },
        {
            id: 'users',
            title: 'User Accounts',
            description: 'View and manage user accounts',
            icon: faUsers,
            count: itemCounts.users,
            color: '#c864ff'
        }
    ];

    return (
        <div className="admin-menu">
            <div className="admin-menu-header">
                <h1>Admin Dashboard</h1>
                <p>Manage your application content and users</p>
            </div>
            <div className="admin-menu-grid">
                {menuOptions.map(option => (
                    <div 
                        key={option.id}
                        className="admin-menu-card"
                        onClick={() => onSelectOption(option.id)}
                        style={{ '--card-color': option.color }}
                    >
                        <div className="card-icon">
                            <FontAwesomeIcon icon={option.icon} />
                        </div>
                        <div className="card-content">
                            <h3>{option.title}</h3>
                            <p>{option.description}</p>
                        </div>
                        <div className="card-count">{option.count}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * DataListView Component
 * 
 * Generic list view for displaying and managing data items
 */
function DataListView({ 
    title, 
    data, 
    columns, 
    onBack, 
    onEdit, 
    onDelete, 
    onView,
    onCreateNew,
    loading,
    searchTerm,
    onSearchChange,
    itemType 
}) {
    const filteredData = data.filter(item => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return columns.some(col => {
            const value = item[col.key];
            if (value === null || value === undefined) return false;
            return String(value).toLowerCase().includes(searchLower);
        });
    });

    return (
        <div className="admin-data-list">
            <div className="data-list-header">
                <button className="back-button" onClick={onBack}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Back to Menu
                </button>
                <h2>{title}</h2>
                <div className="header-actions">
                    <div className="search-box">
                        <FontAwesomeIcon icon={faSearch} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                    {onCreateNew && (
                        <button className="create-new-button" onClick={onCreateNew}>
                            <FontAwesomeIcon icon={faPlus} /> Create New
                        </button>
                    )}
                </div>
            </div>
            
            {loading ? (
                <div className="loading-container">
                    <LoadingSpinner />
                    <p>Loading {title.toLowerCase()}...</p>
                </div>
            ) : filteredData.length === 0 ? (
                <div className="empty-state">
                    <p>No {title.toLowerCase()} found</p>
                </div>
            ) : (
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th key={col.key}>{col.label}</th>
                                ))}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map(item => (
                                <tr key={item.id}>
                                    {columns.map(col => (
                                        <td key={col.key}>
                                            {col.render ? col.render(item[col.key], item) : item[col.key]}
                                        </td>
                                    ))}
                                    <td className="actions-cell">
                                        {onView && (
                                            <button 
                                                className="action-btn view-btn" 
                                                onClick={() => onView(item)}
                                                title="View"
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                        )}
                                        {onEdit && (
                                            <button 
                                                className="action-btn edit-btn" 
                                                onClick={() => onEdit(item)}
                                                title="Edit"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button 
                                                className="action-btn delete-btn" 
                                                onClick={() => onDelete(item)}
                                                title="Delete"
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

/**
 * MapEditorContent Component
 * 
 * Handles all map-specific logic and interactions.
 * Must be used inside a Map component to access the map instance.
 */
function MapEditorContent({ 
    isDrawing,
    tempPath,
    setTempPath,
    setIsDrawing,
    setMousePosition,
    routes,
    setRoutes
}) {
    const map = useMap();
    const drawingStateRef = useRef({ isDrawing, tempPath });

    /**
     * Synchronizes drawing state with ref for async operations
     */
    useEffect(() => {
        drawingStateRef.current.isDrawing = isDrawing;
        drawingStateRef.current.tempPath = tempPath;
    }, [isDrawing, tempPath]);

    /**
     * Always disable Google Maps double-click zoom and handle manually
     */
    useEffect(() => {
        if (map) {
            map.setOptions({ disableDoubleClickZoom: true });
        }
    }, [map]);

    /**
     * Sets up interactive map event listeners for route drawing
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

        // Handle double-click to complete route drawing or zoom
        const dblClickListener = map.addListener('dblclick', (e) => {
            const { isDrawing, tempPath } = drawingStateRef.current;
            
            if (isDrawing) {
                // When drawing: complete the route and prevent any zoom
                if (tempPath.length > 1) {
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
            } else {
                // When not drawing: manually handle zoom-in
                const currentZoom = map.getZoom();
                map.setZoom(currentZoom + 1);
                map.panTo(e.latLng);
            }
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
    }, [map, routes.length, setTempPath, setIsDrawing, setMousePosition, setRoutes]);

    return null; // This component doesn't render anything, it just manages map interactions
}

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
    // Get settings for reactive updates
    const { settings } = useSettings();

    // ========== ADMIN MENU STATE ==========
    const [currentView, setCurrentView] = useState('menu'); // 'menu', 'exploration', 'adventure', 'guides', 'community_posts', 'users', 'editor'
    const [editingItem, setEditingItem] = useState(null); // Item being edited (for map/creator tools)
    const [listData, setListData] = useState([]); // Data for current list view
    const [listLoading, setListLoading] = useState(false);
    const [listSearchTerm, setListSearchTerm] = useState('');
    const [itemCounts, setItemCounts] = useState({
        exploration: 0,
        adventure: 0,
        guides: 0,
        communityPosts: 0,
        users: 0
    });

    // ========== MAP PROVIDER STATE ==========
    const [mapProvider, setMapProvider] = useState('google'); // 'google' or 'osmap'

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

    // ========== NOTIFICATION STATE ==========
    const [notification, setNotification] = useState({ isVisible: false, message: '', type: 'info' });

    // ========== ALERT MODAL STATE ==========
    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    // Ref for search functionality
    const searchInputRef = useRef(null);
    const leafletMapRef = useRef(null); // Ref for Leaflet map instance (OS Maps)

    /**
     * Fetches item counts for the admin dashboard
     */
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [explorationSnap, adventureSnap, guidesSnap, communityPostsSnap, usersSnap] = await Promise.all([
                    getDocs(collection(db, 'exploration')),
                    getDocs(collection(db, 'adventure')),
                    getDocs(collection(db, 'posts')),
                    getDocs(collection(db, 'community_posts')),
                    getDocs(collection(db, 'users'))
                ]);
                
                setItemCounts({
                    exploration: explorationSnap.size,
                    adventure: adventureSnap.size,
                    guides: guidesSnap.size,
                    communityPosts: communityPostsSnap.size,
                    users: usersSnap.size
                });
            } catch (error) {
                console.error('Error fetching counts:', error);
            }
        };
        
        if (currentView === 'menu') {
            fetchCounts();
        }
    }, [currentView]);

    /**
     * Fetches data for the current list view
     */
    useEffect(() => {
        const fetchListData = async () => {
            if (currentView === 'menu' || currentView === 'editor') return;
            
            setListLoading(true);
            setListSearchTerm('');
            
            try {
                let collectionName = '';
                switch (currentView) {
                    case 'exploration':
                        collectionName = 'exploration';
                        break;
                    case 'adventure':
                        collectionName = 'adventure';
                        break;
                    case 'guides':
                        collectionName = 'posts';
                        break;
                    case 'community_posts':
                        collectionName = 'community_posts';
                        break;
                    case 'users':
                        collectionName = 'users';
                        break;
                    default:
                        return;
                }
                
                const snapshot = await getDocs(collection(db, collectionName));
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                setListData(data);
            } catch (error) {
                console.error('Error fetching list data:', error);
                setNotification({
                    isVisible: true,
                    message: 'Error loading data. Please try again.',
                    type: 'error'
                });
            } finally {
                setListLoading(false);
            }
        };
        
        fetchListData();
    }, [currentView]);

    /**
     * Handles menu option selection
     */
    const handleMenuSelect = (option) => {
        setCurrentView(option);
    };

    /**
     * Goes back to the menu or list view from editor
     */
    const handleBackToMenu = () => {
        // If we were editing an item, go back to that list view
        const previousView = editingItem ? editingItem.type : null;
        
        if (previousView) {
            setCurrentView(previousView === 'exploration' ? 'exploration' : previousView === 'adventure' ? 'adventure' : 'menu');
        } else {
            setCurrentView('menu');
        }
        
        setEditingItem(null);
        setRoutes([]);
        setIsCreatingItem(false);
        setHasCreatedItemInfo(false);
        setIsDrawing(false);
        setTempPath([]);
        
        // Show appropriate notification
        if (previousView) {
            setNotification({
                isVisible: true,
                message: `Returned to ${previousView}s list`,
                type: 'info'
            });
        }
    };

    /**
     * Goes back to main menu from list views
     */
    const handleBackToMenuFromList = () => {
        setCurrentView('menu');
        setListData([]);
    };

    /**
     * Handles editing an exploration or adventure item
     * Loads the item into the map editor with waypoint table and drawing tools
     */
    const handleEditItem = async (item) => {
        // Show loading notification
        setNotification({
            isVisible: true,
            message: 'Loading item into editor...',
            type: 'info'
        });

        try {
            // Load all routes for this item
            const routesSnapshot = await getDocs(collection(db, currentView, item.id, 'routes'));
            const loadedRoutes = await Promise.all(
                routesSnapshot.docs.map(async (routeDoc) => {
                    const routeData = routeDoc.data();
                    
                    // Load waypoints for this route
                    const waypointsSnapshot = await getDocs(
                        collection(db, currentView, item.id, 'routes', routeDoc.id, 'waypoints')
                    );
                    const waypoints = waypointsSnapshot.docs.map(wpDoc => ({
                        firestoreId: wpDoc.id,
                        ...wpDoc.data()
                    }));
                    
                    return {
                        id: routeDoc.id,
                        firestoreId: routeDoc.id,
                        ...routeData,
                        waypoints: waypoints.sort((a, b) => (a.order || 0) - (b.order || 0))
                    };
                })
            );
            
            // Set up editor state with loaded data
            setRoutes(loadedRoutes.sort((a, b) => (a.order || 0) - (b.order || 0)));
            setEditingItem({ ...item, type: currentView });
            setMapProvider(item.mapProvider || 'google');
            setHasCreatedItemInfo(true); // Enable waypoint table
            setIsCreatingItem(true); // Show drawing tools
            setCurrentView('editor'); // Switch to map editor view
            
            // Success notification
            setNotification({
                isVisible: true,
                message: `Loaded "${item.name}" into editor with ${loadedRoutes.length} route(s)`,
                type: 'success'
            });
        } catch (error) {
            console.error('Error loading item for editing:', error);
            setNotification({
                isVisible: true,
                message: 'Error loading item. Please try again.',
                type: 'error'
            });
        }
    };

    /**
     * Handles creating a new exploration or adventure
     */
    const handleCreateNew = () => {
        setRoutes([]);
        setEditingItem(null);
        setHasCreatedItemInfo(false);
        setIsCreatingItem(true);
        setCurrentView('editor');
    };

    /**
     * Handles deleting an item
     */
    const handleDeleteItem = async (item) => {
        setAlertModal({
            isOpen: true,
            title: 'Confirm Deletion',
            message: `Are you sure you want to delete "${item.title || item.name || item.id}"? This action cannot be undone.`,
            onConfirm: async () => {
                setAlertModal({ isOpen: false, title: '', message: '', onConfirm: null });
                
                try {
                    let collectionName = '';
                    switch (currentView) {
                        case 'explorations':
                            collectionName = 'exploration';
                            break;
                        case 'adventures':
                            collectionName = 'adventure';
                            break;
                        case 'guides':
                            collectionName = 'posts';
                            break;
                        case 'community_posts':
                            collectionName = 'community_posts';
                            break;
                        case 'users':
                            collectionName = 'users';
                            break;
                        default:
                            return;
                    }
                    
                    // For explorations and adventures, also delete routes and waypoints
                    if (currentView === 'explorations' || currentView === 'adventures') {
                        const routesSnapshot = await getDocs(collection(db, collectionName, item.id, 'routes'));
                        for (const routeDoc of routesSnapshot.docs) {
                            const waypointsSnapshot = await getDocs(
                                collection(db, collectionName, item.id, 'routes', routeDoc.id, 'waypoints')
                            );
                            for (const wpDoc of waypointsSnapshot.docs) {
                                await deleteDoc(doc(db, collectionName, item.id, 'routes', routeDoc.id, 'waypoints', wpDoc.id));
                            }
                            await deleteDoc(doc(db, collectionName, item.id, 'routes', routeDoc.id));
                        }
                    }
                    
                    await deleteDoc(doc(db, collectionName, item.id));
                    
                    setListData(prev => prev.filter(i => i.id !== item.id));
                    setNotification({
                        isVisible: true,
                        message: 'Item deleted successfully.',
                        type: 'success'
                    });
                } catch (error) {
                    console.error('Error deleting item:', error);
                    setNotification({
                        isVisible: true,
                        message: 'Error deleting item. Please try again.',
                        type: 'error'
                    });
                }
            }
        });
    };

    /**
     * Gets column configuration for the current view
     */
    const getColumnsForView = () => {
        const formatDate = (timestamp) => {
            if (!timestamp) return 'N/A';
            if (timestamp.toDate) {
                return timestamp.toDate().toLocaleDateString();
            }
            if (timestamp instanceof Date) {
                return timestamp.toLocaleDateString();
            }
            return 'N/A';
        };

        const truncateText = (text, maxLength = 50) => {
            if (!text) return 'N/A';
            return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        };

        switch (currentView) {
            case 'exploration':
            case 'adventure':
                return [
                    { key: 'name', label: 'Title', render: (val) => truncateText(val, 40) },
                    { key: 'description', label: 'Location', render: (val) => truncateText(val, 30) },
                    { key: 'status', label: 'Status', render: (val) => (
                        <span className={`status-badge ${val || 'draft'}`}>
                            {val || 'draft'}
                        </span>
                    )},
                    { key: 'mapProvider', label: 'Map', render: (val) => val === 'osmap' ? 'OS Maps' : 'Google' },
                    { key: 'createdAt', label: 'Created', render: formatDate }
                ];
            case 'guides':
                return [
                    { key: 'title', label: 'Title', render: (val) => truncateText(val, 40) },
                    { key: 'category', label: 'Category' },
                    { key: 'authorName', label: 'Author', render: (val) => truncateText(val, 20) },
                    { key: 'status', label: 'Status', render: (val) => (
                        <span className={`status-badge ${val || 'draft'}`}>
                            {val || 'draft'}
                        </span>
                    )},
                    { key: 'createdAt', label: 'Created', render: formatDate }
                ];
            case 'community_posts':
                return [
                    { key: 'content', label: 'Content', render: (val) => truncateText(val, 60) },
                    { key: 'authorName', label: 'Author', render: (val) => truncateText(val, 20) },
                    { key: 'likes', label: 'Likes', render: (val) => Array.isArray(val) ? val.length : 0 },
                    { key: 'createdAt', label: 'Created', render: formatDate }
                ];
            case 'users':
                return [
                    { key: 'displayName', label: 'Name', render: (val) => truncateText(val, 30) },
                    { key: 'email', label: 'Email', render: (val) => truncateText(val, 35) },
                    { key: 'isCreator', label: 'Creator', render: (val) => val ? '✓ Yes' : 'No' },
                    { key: 'isAdmin', label: 'Admin', render: (val) => val ? '✓ Yes' : 'No' },
                    { key: 'createdAt', label: 'Joined', render: formatDate }
                ];
            default:
                return [];
        }
    };

    /**
     * Gets title for the current view
     */
    const getViewTitle = () => {
        switch (currentView) {
            case 'exploration': return 'Explorations';
            case 'adventure': return 'Adventures';
            case 'guides': return 'Guides (Posts)';
            case 'community_posts': return 'Community Posts';
            case 'users': return 'User Accounts';
            default: return '';
        }
    };

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
     * Undoes the last point added to the current drawing path
     * 
     * Removes the most recent coordinate from the temporary path,
     * allowing users to correct mistakes while drawing a route.
     */
    const handleUndoLastPoint = () => {
        if (isDrawing && tempPath.length > 0) {
            setTempPath(prevPath => prevPath.slice(0, -1));
        }
    };

    /**
     * Saves route and waypoint data to Firestore as draft
     * 
     * Handles the complex process of saving nested route and waypoint data:
     * - Updates existing routes/waypoints or creates new ones
     * - Deletes routes that have been removed from the local state
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
            setNotification({
                isVisible: true,
                message: 'Error: No item ID found. Please create an item first.',
                type: 'error'
            });
            return;
        }

        try {
            // First, get all existing routes from Firestore to handle deletions
            const routesCollectionRef = collection(db, itemData.type, itemId, 'routes');
            const existingRoutesSnapshot = await getDocs(routesCollectionRef);
            const existingRouteIds = existingRoutesSnapshot.docs.map(doc => doc.id);
            const currentRouteIds = routes.filter(route => route.firestoreId).map(route => route.firestoreId);

            // Delete routes that are no longer in the current routes array
            const routesToDelete = existingRouteIds.filter(id => !currentRouteIds.includes(id));
            
            for (const routeIdToDelete of routesToDelete) {
                // First delete all waypoints in the route
                const waypointsCollectionRef = collection(db, itemData.type, itemId, 'routes', routeIdToDelete, 'waypoints');
                const waypointsSnapshot = await getDocs(waypointsCollectionRef);
                
                for (const waypointDoc of waypointsSnapshot.docs) {
                    await deleteDoc(doc(db, itemData.type, itemId, 'routes', routeIdToDelete, 'waypoints', waypointDoc.id));
                }
                
                // Then delete the route itself
                await deleteDoc(doc(db, itemData.type, itemId, 'routes', routeIdToDelete));
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
                    } else {
                        const routesCollectionRef = collection(db, itemData.type, itemId, 'routes');
                        routeDocRef = await addDoc(routesCollectionRef, {
                            coordinates: route.coordinates,
                            order: routeOrder
                        });
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

                            if (waypoint.firestoreId) {
                                // Try to update existing waypoint
                                try {
                                    const waypointDocRef = doc(waypointsCollectionRef, waypoint.firestoreId);
                                    await updateDoc(waypointDocRef, waypointDataToSave);
                                    newWaypointsWithIds.push(waypoint);
                                } catch (error) {
                                    // If document doesn't exist, create a new one
                                    try {
                                        const docRef = await addDoc(waypointsCollectionRef, waypointDataToSave);
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

            setNotification({
                isVisible: true,
                message: 'Routes and waypoints saved successfully! 🎉',
                type: 'success'
            });

        } catch (error) {
            console.error("Error saving draft:", error);
            setNotification({
                isVisible: true,
                message: 'Error saving draft. Please try again.',
                type: 'error'
            });
        }
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
            setNotification({
                isVisible: true,
                message: 'Error: No item ID found. Please save a draft first',
                type: 'error'
            });
            return;
        }

        try {
            const docRef = doc(db, itemData.type, itemId);
            await updateDoc(docRef, {
                status: 'published',
                publishedAt: new Date(),
            });
            setNotification({
                isVisible: true,
                message: `Item: ${itemId} has been published.`,
                type: 'success'
            });
        } catch (error) {
            console.error("Error publishing item:", error);
            setNotification({
                isVisible: true,
                message: 'Error publishing item. Please try again.',
                type: 'error'
            });
        }
    }

    // Calculate live drawing path for visual feedback
    // Includes mouse position as the last point when actively drawing
    const livePath = isDrawing && mousePosition && tempPath.length > 0
        ? [...tempPath, mousePosition]
        : tempPath;



    /**
     * Detects if input is a coordinate pair and parses it
     * Supports formats: "lat, lng", "lat,lng", "lat lng"
     * 
     * @param {string} input - The input string to parse
     * @returns {Object|null} - {lat, lng} object or null if not valid coordinates
     */
    const parseCoordinates = (input) => {
        if (!input) return null;
        
        // Remove extra whitespace and try to parse coordinates
        const trimmed = input.trim();
        
        // Match patterns like: "44.111, -1.2222" or "44.111,-1.2222" or "44.111 -1.2222"
        const coordPattern = /^(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)$/;
        const match = trimmed.match(coordPattern);
        
        if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            
            // Validate coordinate ranges
            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                return { lat, lng };
            }
        }
        
        return null;
    };

    /**
     * Fetches place suggestions from Google Places AutocompleteSuggestion API
     * 
     * Called when user types in the search input to provide real-time suggestions.
     * 
     * @param {string} input - The search query
     * @param {boolean} isExplicitSearch - Whether this is an explicit search (button/Enter)
     * @returns {Promise<boolean>} - True if results were found, false otherwise
     */
    const fetchSuggestions = async (input, isExplicitSearch = false) => {
        if (!input.trim() || !window.google?.maps?.places?.AutocompleteSuggestion) {
            setSuggestions([]);
            setShowSuggestions(false);
            return false;
        }

        // Check if input is coordinates - don't fetch suggestions for coordinate input
        const coords = parseCoordinates(input);
        if (coords) {
            setSuggestions([]);
            setShowSuggestions(false);
            return true; // Valid coordinates
        }

        try {
            const request = {
                input: input,
                // No country restrictions - global search enabled
            };

            const { suggestions } = await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
            
            if (suggestions && suggestions.length > 0) {
                // Convert new API format to match old format for compatibility
                const formattedSuggestions = suggestions.map(suggestion => ({
                    place_id: suggestion.placePrediction.placeId,
                    description: suggestion.placePrediction.text.text,
                    structured_formatting: {
                        main_text: suggestion.placePrediction.structuredFormat?.mainText?.text || suggestion.placePrediction.text.text,
                        secondary_text: suggestion.placePrediction.structuredFormat?.secondaryText?.text || ''
                    }
                }));
                setSuggestions(formattedSuggestions);
                setShowSuggestions(true);
                setSelectedSuggestionIndex(-1);
                return true;
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
                if (isExplicitSearch) {
                    setNotification({
                        isVisible: true,
                        message: `No results found for "${input}"`,
                        type: 'warning'
                    });
                }
                return false;
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            setSuggestions([]);
            setShowSuggestions(false);
            if (isExplicitSearch) {
                setNotification({
                    isVisible: true,
                    message: 'Error searching for location. Please try again.',
                    type: 'error'
                });
            }
            return false;
        }
    };

    /**
     * Handles explicit search (via search button or Enter key)
     */
    const handleSearch = async () => {
        if (!searchValue.trim()) {
            setNotification({
                isVisible: true,
                message: 'Please enter a location to search',
                type: 'info'
            });
            return;
        }

        // Check if input is coordinates
        const coords = parseCoordinates(searchValue);
        if (coords) {
            // Handle coordinate input directly for both map providers
            if (mapProvider === 'google' && map) {
                map.setCenter({ lat: coords.lat, lng: coords.lng });
                map.setZoom(14);
            } else if (mapProvider === 'osmap' && leafletMapRef.current) {
                leafletMapRef.current.setView([coords.lat, coords.lng], 11);
            }
            
            setShowSuggestions(false);
            setNotification({
                isVisible: true,
                message: `Centered on coordinates: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
                type: 'success'
            });
            return;
        }

        const hasResults = await fetchSuggestions(searchValue, true);
        
        // If we have results and exactly one, auto-select it
        if (hasResults && suggestions.length === 1) {
            handleSuggestionSelect(suggestions[0].place_id, suggestions[0].description);
        }
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
        if (!window.google?.maps?.places?.PlacesService) return;
        
        // For Google Maps, we can use the map instance directly
        // For OS Maps, we need to create a hidden div for the service
        let serviceMap = map;
        if (mapProvider === 'osmap') {
            const dummyDiv = document.createElement('div');
            serviceMap = new window.google.maps.Map(dummyDiv);
        }
        
        const service = new window.google.maps.places.PlacesService(serviceMap);

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

                // Center the appropriate map on the selected location
                if (mapProvider === 'google' && map) {
                    map.setCenter({ lat, lng });
                    map.setZoom(zoomLevel);
                } else if (mapProvider === 'osmap' && leafletMapRef.current) {
                    // For Leaflet, convert Google zoom levels (lower = more zoomed out)
                    // Leaflet zoom: 7 = country, 10 = city, 14 = neighborhood, 16 = street
                    const leafletZoom = Math.max(7, Math.min(13, zoomLevel - 3));
                    leafletMapRef.current.setView([lat, lng], leafletZoom);
                }
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
            } else {
                // Perform explicit search
                handleSearch();
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
     * Centers the map over all route coordinates
     * 
     * Calculates bounds from all coordinates in all routes and uses fitBounds
     * to center the map view over the entire route collection.
     * 
     * @param {Array} routes - Array of route objects with coordinates
     */
    const centerMapOverRoutes = (routes) => {
        // TODO: This function needs to be refactored to work without direct map access
        // For now, this feature is disabled when not in editor mode
        console.log('Center map over routes called - feature needs refactoring');
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
    } else if (mapTheme === 'adventure') {
        effectiveMapId = '8a2ac04064bf383360bc1cbc';
        colorScheme = 'LIGHT';
    }

    // Get scale bar and compass settings
    const showScaleBar = settings.showScaleBar !== undefined ? settings.showScaleBar : true;
    const showCompass = settings.showCompass !== undefined ? settings.showCompass : true;

    // ========== COMPONENT RENDER ==========
    
    // Show Admin Menu
    if (currentView === 'menu') {
        return (
            <div className="admin-dashboard">
                <AdminMenu 
                    onSelectOption={handleMenuSelect} 
                    itemCounts={itemCounts}
                />
                <Notification
                    isVisible={notification.isVisible}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ ...notification, isVisible: false })}
                    duration={3000}
                    position="top-center"
                />
                <AlertModal
                    isOpen={alertModal.isOpen}
                    title={alertModal.title}
                    message={alertModal.message}
                    type="warning"
                    onConfirm={alertModal.onConfirm}
                    onCancel={() => setAlertModal({ isOpen: false, title: '', message: '', onConfirm: null })}
                    confirmText="Yes"
                    cancelText="Cancel"
                    showCancel={true}
                />
            </div>
        );
    }

    // Show List View for exploration, adventure, guides, community_posts, or users
    if (['exploration', 'adventure', 'guides', 'community_posts', 'users'].includes(currentView)) {
        return (
            <div className="admin-dashboard">
                <DataListView
                    title={getViewTitle()}
                    data={listData}
                    columns={getColumnsForView()}
                    onBack={handleBackToMenuFromList}
                    onEdit={(currentView === 'exploration' || currentView === 'adventure') ? handleEditItem : null}
                    onDelete={handleDeleteItem}
                    onView={null}
                    onCreateNew={(currentView === 'exploration' || currentView === 'adventure') ? handleCreateNew : null}
                    loading={listLoading}
                    searchTerm={listSearchTerm}
                    onSearchChange={setListSearchTerm}
                    itemType={currentView}
                />
                <Notification
                    isVisible={notification.isVisible}
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ ...notification, isVisible: false })}
                    duration={3000}
                    position="top-center"
                />
                <AlertModal
                    isOpen={alertModal.isOpen}
                    title={alertModal.title}
                    message={alertModal.message}
                    type="warning"
                    onConfirm={alertModal.onConfirm}
                    onCancel={() => setAlertModal({ isOpen: false, title: '', message: '', onConfirm: null })}
                    confirmText="Yes, Delete"
                    cancelText="Cancel"
                    showCancel={true}
                />
            </div>
        );
    }

    // Show Map Editor ONLY when in editor mode
    if (currentView === 'editor') {
        return (
        <div style={{ height: '100%', width: '100%' }} id='admin-tools'>
            {/* Back Button */}
            <button
                onClick={() => {
                    setAlertModal({
                        isOpen: true,
                        title: 'Confirm Navigation',
                        message: 'Are you sure you want to go back? Any unsaved changes will be lost.',
                        onConfirm: () => {
                            setAlertModal({ isOpen: false, title: '', message: '', onConfirm: null });
                            handleBackToMenu();
                        }
                    });
                }}
                style={{
                    position: 'absolute',
                    top: '12px',
                    left: `${mapProvider === 'osmap' ? '10px' : '320px'}`,
                    zIndex: 1001,
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(100, 200, 255, 0.4)',
                    background: 'linear-gradient(135deg, rgba(15, 20, 25, 0.95) 0%, rgba(22, 33, 62, 0.9) 100%)',
                    color: '#64c8ff',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(100, 200, 255, 0.2)'
                }}
                onMouseEnter={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, rgba(22, 33, 62, 0.95) 0%, rgba(30, 45, 80, 0.95) 100%)';
                    e.target.style.borderColor = 'rgba(100, 200, 255, 0.6)';
                    e.target.style.boxShadow = '0 4px 12px rgba(100, 200, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.background = 'linear-gradient(135deg, rgba(15, 20, 25, 0.95) 0%, rgba(22, 33, 62, 0.9) 100%)';
                    e.target.style.borderColor = 'rgba(100, 200, 255, 0.4)';
                    e.target.style.boxShadow = '0 2px 8px rgba(100, 200, 255, 0.2)';
                }}
            >
                <FontAwesomeIcon icon={faArrowLeft} /> 
                {editingItem ? `Back to ${editingItem.type === 'exploration' ? 'Explorations' : 'Adventures'}` : 'Back to Menu'}
            </button>

            {/* Map Provider Selector */}
            <div style={{
                position: 'absolute',
                top: `${mapProvider === 'osmap' ? '60px' : '10px'}`,
                left: '10px',
                zIndex: 1000,
                background: 'linear-gradient(135deg, rgba(15, 20, 25, 0.95) 0%, rgba(22, 33, 62, 0.9) 100%)',
                border: '2px solid rgba(255, 165, 0, 0.6)',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(255, 165, 0, 0.3)',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                minWidth: '280px'
            }}>
                <div style={{
                    background: 'linear-gradient(90deg, #ff6b35 0%, #f7931e 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: '12px',
                    fontWeight: '700',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    marginBottom: '4px'
                }}>
                    ⚠ Important - Cannot Change Later
                </div>
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center'
                }}>
                    <label style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#64c8ff',
                        letterSpacing: '0.5px',
                        whiteSpace: 'nowrap'
                    }}>Select Map:</label>
                    <select
                        value={mapProvider}
                        onChange={(e) => setMapProvider(e.target.value)}
                        disabled={hasCreatedItemInfo}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(100, 200, 255, 0.4)',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: hasCreatedItemInfo ? 'not-allowed' : 'pointer',
                            background: hasCreatedItemInfo 
                                ? 'linear-gradient(135deg, rgba(100, 100, 100, 0.15) 0%, rgba(80, 80, 80, 0.1) 100%)'
                                : 'linear-gradient(135deg, rgba(100, 200, 255, 0.15) 0%, rgba(100, 255, 150, 0.1) 100%)',
                            color: hasCreatedItemInfo ? '#888' : '#64c8ff',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            opacity: hasCreatedItemInfo ? 0.6 : 1
                        }}
                    >
                        <option value="google" style={{ background: '#0f1419', color: '#64c8ff' }}>Google Maps</option>
                        <option value="osmap" style={{ background: '#0f1419', color: '#64c8ff' }}>OS Maps (UK Only)</option>
                    </select>
                </div>
                <div style={{
                    fontSize: '11px',
                    color: '#ff9966',
                    lineHeight: '1.4',
                    fontStyle: 'italic'
                }}>
                    Choose your map before creating your project
                </div>
            </div>

            {/* Interactive map with route drawing capabilities */}
            {mapProvider === 'google' ? (
                <Map
                    mapId={effectiveMapId}
                    defaultZoom={3}
                    defaultCenter={{ lat: 30, lng: 0 }} // Centered on UK
                    clickableIcons={false} // Disable default map icons to prevent interference
                    mapTypeId={mapType} // Map type from settings
                    colorScheme={colorScheme}
                    options={{
                        scaleControl: showScaleBar,
                        rotateControl: showCompass
                    }}
                >
                    {/* Map interaction handler */}
                    <MapEditorContent
                        isDrawing={isDrawing}
                        tempPath={tempPath}
                        setTempPath={setTempPath}
                        setIsDrawing={setIsDrawing}
                        setMousePosition={setMousePosition}
                        routes={routes}
                        setRoutes={setRoutes}
                    />

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
                    <CompassControlManager showCompass={showCompass} />
                </Map>
            ) : (
                <OSMapAdmin
                    mapRef={leafletMapRef}
                    isDrawing={isDrawing}
                    tempPath={tempPath}
                    mousePosition={mousePosition}
                    routes={routes}
                    onAddPoint={(point) => {
                        setTempPath((prevPath) => [...prevPath, point]);
                    }}
                    onComplete={() => {
                        if (tempPath.length > 1) {
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
                    }}
                    onMouseMove={(position) => {
                        setMousePosition(position);
                    }}
                />
            )}

            {/* Drawing control buttons */}
            <div className="drawing-tool" style={{
                position: 'absolute',
                top: '0px',
                right: `${mapProvider === 'osmap' ? '-5px' : '40px'}`,
                zIndex: 1000,
                padding: '10px 20px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                {!isCreatingItem ? (
                    <button 
                        onClick={() => handleCreateItem()} 
                        style={{ 
                            marginRight: '5px',
                            padding: '10px 20px',
                            height: '38px',
                            borderRadius: '8px',
                            border: '1px solid rgba(100, 200, 255, 0.4)',
                            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(21, 128, 61, 0.9) 100%)',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 8px rgba(100, 255, 150, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, rgba(21, 128, 61, 0.9) 0%, rgba(16, 102, 49, 1) 100%)';
                            e.target.style.borderColor = 'rgba(100, 200, 255, 0.6)';
                            e.target.style.boxShadow = '0 4px 12px rgba(100, 255, 150, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(21, 128, 61, 0.9) 100%)';
                            e.target.style.borderColor = 'rgba(100, 200, 255, 0.4)';
                            e.target.style.boxShadow = '0 2px 8px rgba(100, 255, 150, 0.3)';
                        }}
                    >
                        Create Exploration/Adventure
                    </button>
                ) : hasCreatedItemInfo ? (
                    <>
                        {!isDrawing ? (
                            <button 
                                onClick={() => setIsDrawing(true)}
                                style={{
                                    padding: '10px 20px',
                                    height: '38px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(100, 200, 255, 0.4)',
                                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.9) 100%)',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 8px rgba(100, 200, 255, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'linear-gradient(135deg, rgba(37, 99, 235, 0.9) 0%, rgba(29, 78, 216, 1) 100%)';
                                    e.target.style.borderColor = 'rgba(100, 200, 255, 0.6)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(100, 200, 255, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(37, 99, 235, 0.9) 100%)';
                                    e.target.style.borderColor = 'rgba(100, 200, 255, 0.4)';
                                    e.target.style.boxShadow = '0 2px 8px rgba(100, 200, 255, 0.3)';
                                }}
                            >
                                Start Drawing
                            </button>
                        ) : (
                            <>
                                {/* Undo button - appears when drawing */}
                                <button 
                                    onClick={handleUndoLastPoint}
                                    disabled={tempPath.length === 0}
                                    style={{
                                        padding: '8px 12px',
                                        height: '38px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(100, 200, 255, 0.4)',
                                        background: tempPath.length === 0 
                                            ? 'linear-gradient(135deg, rgba(107, 114, 128, 0.4) 0%, rgba(75, 85, 99, 0.5) 100%)'
                                            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.8) 0%, rgba(217, 119, 6, 0.9) 100%)',
                                        color: tempPath.length === 0 ? '#9CA3AF' : '#fff',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: tempPath.length === 0 ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: tempPath.length === 0 
                                            ? '0 2px 8px rgba(107, 114, 128, 0.2)'
                                            : '0 2px 8px rgba(245, 158, 11, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (tempPath.length > 0) {
                                            e.target.style.background = 'linear-gradient(135deg, rgba(217, 119, 6, 0.9) 0%, rgba(180, 83, 9, 1) 100%)';
                                            e.target.style.borderColor = 'rgba(100, 200, 255, 0.6)';
                                            e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (tempPath.length > 0) {
                                            e.target.style.background = 'linear-gradient(135deg, rgba(245, 158, 11, 0.8) 0%, rgba(217, 119, 6, 0.9) 100%)';
                                            e.target.style.borderColor = 'rgba(100, 200, 255, 0.4)';
                                            e.target.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.3)';
                                        }
                                    }}
                                    title={`Undo last point${tempPath.length > 0 ? ` (${tempPath.length} points)` : ' (no points to undo)'}`}
                                >
                                    <FontAwesomeIcon icon={faUndo} />
                                    <span>Undo</span>
                                </button>

                                {/* Stop Drawing button */}
                                <button 
                                    onClick={handleStopDrawing}
                                    style={{
                                        padding: '10px 20px',
                                        height: '38px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(100, 200, 255, 0.4)',
                                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.8) 0%, rgba(185, 28, 28, 0.9) 100%)',
                                        color: '#fff',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'linear-gradient(135deg, rgba(185, 28, 28, 0.9) 0%, rgba(153, 27, 27, 1) 100%)';
                                        e.target.style.borderColor = 'rgba(100, 200, 255, 0.6)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.8) 0%, rgba(185, 28, 28, 0.9) 100%)';
                                        e.target.style.borderColor = 'rgba(100, 200, 255, 0.4)';
                                        e.target.style.boxShadow = '0 2px 8px rgba(255, 107, 107, 0.3)';
                                    }}
                                >
                                    Stop Drawing
                                </button>
                            </>
                        )}

                        {/* Location search bar with autocomplete */}
                        {
                            <div className="search-container" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                marginLeft: '10px',
                                gap: '8px'
                            }}>
                                <div style={{ position: 'relative', display: 'flex' }}>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Search location or coordinates (lat, lng)..."
                                        value={searchValue}
                                        onChange={handleSearchInputChange}
                                        onKeyDown={handleSearchKeyPress}
                                        onBlur={handleSearchBlur}
                                        onFocus={() => {
                                            updateInputPosition();
                                            if (searchValue) setShowSuggestions(true);
                                        }}
                                        style={{
                                            padding: '8px 35px 8px 12px',
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
                                            type="button"
                                            tabIndex={-1}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>

                                {/* Search button */}
                                <button
                                    onClick={handleSearch}
                                    style={{
                                        padding: '8px 16px',
                                        height: '38px',
                                        borderRadius: '4px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #64c8ff 0%, #4a9fd8 100%)',
                                        color: '#fff',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 2px 8px rgba(100, 200, 255, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = 'linear-gradient(135deg, #4a9fd8 0%, #3a8fc8 100%)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(100, 200, 255, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'linear-gradient(135deg, #64c8ff 0%, #4a9fd8 100%)';
                                        e.target.style.boxShadow = '0 2px 8px rgba(100, 200, 255, 0.3)';
                                    }}
                                >
                                    <span>🔍</span>
                                    <span>Search</span>
                                </button>
                            </div>
                        }
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
                        setHasCreatedItemInfo(value);
                    }}
                    onCenterMapOverRoutes={centerMapOverRoutes}
                    initialEditingItem={editingItem}
                    mapProvider={mapProvider}
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

            {/* Notification component for user messages */}
            <Notification
                isVisible={notification.isVisible}
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification({ ...notification, isVisible: false })}
                duration={3000}
                position="top-center"
            />

            {/* Alert Modal for confirmations */}
            <AlertModal
                isOpen={alertModal.isOpen}
                title={alertModal.title}
                message={alertModal.message}
                type="warning"
                onConfirm={alertModal.onConfirm}
                onCancel={() => setAlertModal({ isOpen: false, title: '', message: '', onConfirm: null })}
                confirmText="Yes, Go Back"
                cancelText="Cancel"
                showCancel={true}
            />
        </div>
        );
    }

    // Fallback - should never reach here
    return (
        <div className="admin-dashboard">
            <p>Invalid view state: {currentView}</p>
            <button onClick={() => setCurrentView('menu')}>Return to Menu</button>
        </div>
    );
}

export default Admin;