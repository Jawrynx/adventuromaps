/**
 * MainContent.jsx - Primary layout and state managemen    // ========== DEMO DATA STATE ==========
    const [structuredRouteData, setStructuredRouteData] = useState([]); // Organized route data for demo mode
    const [currentDemoPath, setCurrentDemoPath] = useState([]);     // Current path being displayed in demo
    const [smoothPanFunction, setSmoothPanFunction] = useState(null); // Reference to map's smooth pan function
    const [isInitialDemoSetup, setIsInitialDemoSetup] = useState(false); // Flag for initial setup phase
    const [demoStartTime, setDemoStartTime] = useState(null);       // Timestamp when demo started
    const [includeNarration, setIncludeNarration] = useState(false); // Whether narration is enabled for current demoonent
 * 
 * This component serves as the main orchestrator for the AdventuroMaps application.
 * It manages the overall layout, routing, navigation state, and coordinates between
 * different features like map viewing, route exploration, demo mode, and administrative functions.
 */

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { createUserDocument, getUserDocument } from '../../services/userService';

// UI Components
import Sidebar from '../../components/ui/Sidebar';
import Modal from '../../components/ui/Modal';
import AuthModal from '../../components/ui/AuthModal';

// Map Components
import MainMap from '../../components/map/MainMap';

// Feature Components
import Explore from '../../components/features/Explore';
import Adventure from '../../components/features/Adventure';
import DemoView from '../../components/features/DemoView';
import Guides from '../../components/features/Guides';
import Settings from '../../components/features/Settings';
import Help from '../../components/features/Help';
import Auth from '../../components/features/Auth';
import Profile from '../../components/features/Profile';

// Admin Components
import Admin from '../../components/admin/Admin';

// Settings
import { getSetting } from '../../services/settingsService';

/**
 * Calculates the distance between two coordinates using Haversine formula
 * 
 * @param {Object} coord1 - First coordinate {lat, lng}
 * @param {Object} coord2 - Second coordinate {lat, lng}
 * @returns {number} Distance in meters
 */
const calculateDistance = (coord1, coord2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = coord1.lat * Math.PI/180; // φ, λ in radians
    const φ2 = coord2.lat * Math.PI/180;
    const Δφ = (coord2.lat-coord1.lat) * Math.PI/180;
    const Δλ = (coord2.lng-coord1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
};

/**
 * MainContent Component
 * 
 * The primary layout component that manages:
 * - Application routing and navigation
 * - Sidebar state and responsive layout
 * - Map state and demo mode functionality
 * - Route selection and waypoint management
 * - Modal overlays for different features
 * 
 * @returns {JSX.Element} The main application layout with sidebar and content area
 */
const MainContent = () => {
    // React Router navigation hook
    const navigate = useNavigate();
    
    // ========== NAVIGATION & UI STATE ==========
    const [activeItem, setActiveItem] = useState('map');           // Currently active sidebar item
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);     // Sidebar expanded/collapsed state
    
    // ========== MAP & ROUTE STATE ==========
    const [activeRoute, setActiveRoute] = useState(null);          // Currently selected route for display
    const [zoomLevel, setZoomLevel] = useState(3);                 // Default map zoom level
    const [currentZoom, setCurrentZoom] = useState(3);             // Current map zoom level
    
    // ========== DEMO MODE STATE ==========
    const [isDemoMode, setIsDemoMode] = useState(false);           // Whether demo mode is active
    const [isZooming, setIsZooming] = useState(false);             // Whether map is currently zooming
    const [activeWaypoint, setActiveWaypoint] = useState(null);    // Currently focused waypoint in demo
    const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0); // Index of current waypoint in demo
    
    // ========== DEMO DATA STATE ==========
    const [structuredRouteData, setStructuredRouteData] = useState([]); // Organized route data for demo mode
    const [currentDemoPath, setCurrentDemoPath] = useState([]);     // Current path being displayed in demo
    const [smoothPanFunction, setSmoothPanFunction] = useState(null); // Reference to map's smooth pan function
    const [isInitialDemoSetup, setIsInitialDemoSetup] = useState(false); // Flag for initial demo setup phase
    const [demoStartTime, setDemoStartTime] = useState(null);       // Timestamp when demo started
    const [includeNarration, setIncludeNarration] = useState(false); // Whether narration is enabled for current demo
    
    // ========== AUTHENTICATION STATE ==========
    const [user, setUser] = useState(null);                        // Current authenticated user
    const [userDocument, setUserDocument] = useState(null);        // Full user document from Firestore
    const [isAuthLoading, setIsAuthLoading] = useState(true);      // Whether auth state is being determined
    
    // Use ref to track previous waypoint for distance calculation
    const prevWaypointRef = useRef(null);
    
    /**
     * Handles sidebar navigation clicks
     * 
     * Manages navigation between different sections of the app while ensuring
     * proper cleanup of demo mode and route state when switching views.
     * 
     * @param {string} item - The sidebar item being clicked ('map', 'explore', etc.)
     * @param {string} path - The route path to navigate to
     */
    const handleSidebarClick = useCallback((item, path) => {
        // If demo mode is active, clean up demo state before navigation
        if (isDemoMode || isZooming) {
            setStructuredRouteData([]);
            setIsDemoMode(false);
            setIsZooming(false);
            setActiveWaypoint(null);
            setCurrentDemoPath([]);
            setCurrentZoom(3);
            setCurrentWaypointIndex(0);
        }

        // Clear route data when navigating away from map
        if (item !== 'map') {
            setActiveRoute(null);
            setStructuredRouteData([]);
            setCurrentDemoPath([]);
        }
        
        // Reset map state when returning to map view
        if (path === '/' && item === 'map') {
            setActiveRoute(null);
            setZoomLevel(3);
        }
        
        // Update active item and navigate to new path
        setActiveItem(item);
        navigate(path);
    }, [navigate, isDemoMode]);

    /**
     * Handles route selection from Explore or Adventure components
     * 
     * Sets up the map to display a selected route and cleans up any
     * previous demo or waypoint state.
     * 
     * @param {Object} routeData - The selected route data containing path and waypoint information
     */
    const handleRouteSelection = useCallback((routeData) => {
        setActiveRoute(routeData);          // Set the route to be displayed on map
        setActiveWaypoint(null);            // Clear any active waypoint
        setStructuredRouteData([]);         // Clear demo route data
        setCurrentDemoPath([]);             // Clear demo path
        setCurrentZoom(3);                  // Reset zoom to default level
    }, []);

    /**
     * Initiates demo mode for a selected route
     * 
     * Sets up the interactive demo experience by:
     * - Preparing structured route data for waypoint navigation
     * - Zooming to the first waypoint
     * - Starting the demo mode with appropriate timing delays
     * - Configuring narration preferences for the demo
     * 
     * @param {Object} demoOptions - Demo configuration object containing routes and options
     * @param {Array} demoOptions.routes - Array of route objects with waypoints and paths
     * @param {boolean} demoOptions.includeNarration - Whether narration should be enabled
     */
    const handleStartDemo = useCallback((demoOptions) => {
        // Extract routes and options from the parameter
        const structuredData = demoOptions.routes || demoOptions; // Support both new and legacy format
        const narrationEnabled = demoOptions.includeNarration || false;

        // Clear any existing route display
        setActiveRoute(null);
        setIsZooming(true);                 // Indicate map is zooming
        setIsInitialDemoSetup(true);        // Flag for initial setup period
        setDemoStartTime(Date.now());       // Record when demo started
        setStructuredRouteData(structuredData); // Store route data for demo navigation
        setIncludeNarration(narrationEnabled); // Store narration preference
        setCurrentWaypointIndex(0);         // Start at first waypoint
        setCurrentDemoPath([]);             // Clear any existing demo path
        
        // Reset the previous waypoint ref for distance calculations
        prevWaypointRef.current = null;

        // Validate that we have route data to work with
        if (structuredData.length > 0 && structuredData[0].waypoints.length > 0) {
            const firstWaypoint = structuredData[0].waypoints[0];
            // Handle different coordinate formats
            const coords = firstWaypoint.coordinates || { lat: firstWaypoint.lat, lng: firstWaypoint.lng };
            setActiveWaypoint(coords);
            
            // Initialize the previous waypoint ref with the first waypoint
            prevWaypointRef.current = coords;
            
            // Set initial demo path if available
            if (structuredData[0].path && structuredData[0].path.length > 0) {
                setCurrentDemoPath(structuredData[0].path);
            }

            setCurrentZoom(17);             // Zoom in close for demo view
            
            // Transition from setup to active demo mode after initial zoom completes
            setTimeout(() => {
                setIsZooming(false);
                setIsInitialDemoSetup(false);
                setIsDemoMode(true);        // Activate full demo mode
            }, 4000);

        } else {
            console.warn("No waypoints found to start a demo.");
        }
    }, [currentZoom]);

    /**
     * Ends demo mode and cleans up all demo-related state
     * 
     * Resets the application to normal map view by clearing all
     * demo mode state and returning zoom to default level.
     */
    const handleEndDemo = useCallback(() => {
        setStructuredRouteData([]);         // Clear demo route data
        setIsDemoMode(false);               // Exit demo mode
        setIsZooming(false);                // Stop any zooming operations
        setActiveWaypoint(null);            // Clear active waypoint
        setCurrentDemoPath([]);             // Clear demo path
        setCurrentZoom(3);                  // Reset to default zoom
        setCurrentWaypointIndex(0);         // Reset waypoint index
        setActiveRoute(null);               // Clear any route display
        setIncludeNarration(false);         // Reset narration preference
        
        // Reset the previous waypoint ref
        prevWaypointRef.current = null;
    }, []);

    /**
     * Receives and stores the smooth pan function from the map component
     * 
     * This allows the MainContent to trigger smooth map animations
     * during demo mode waypoint transitions.
     * 
     * @param {Function} panFunction - The map's smooth pan function
     */
    const handleSmoothPanReady = useCallback((panFunction) => {
        setSmoothPanFunction(() => panFunction);
    }, []);

    /**
     * Handles sidebar open/close state changes
     * 
     * Updates the layout state when the sidebar is expanded or collapsed
     * to ensure proper responsive layout adjustments.
     * 
     * @param {boolean} isOpen - Whether the sidebar is open (true) or closed (false)
     */
    const handleSidebarToggle = useCallback((isOpen) => {
        setIsSidebarOpen(isOpen);
    }, []);



    /**
     * Handles waypoint navigation during demo mode
     * 
     * This complex function manages waypoint transitions across multiple routes:
     * - Calculates which route and waypoint corresponds to the given index
     * - Updates the active waypoint and triggers smooth map panning
     * - Respects timing constraints to avoid conflicts during initial setup
     * - Skips cinematic panning when waypoints are very close together
     * 
     * @param {number} index - Global waypoint index across all routes
     * @param {Function} onPanningSkipped - Optional callback to notify when panning is skipped
     */
    const handleWaypointChange = useCallback((index, onPanningSkipped) => {
        let cumulativeWaypointCount = 0;
        let currentWaypoint = null;
        let currentRoute = null;

        // Find which route contains the waypoint at the given global index
        for (const route of structuredRouteData) {
            if (index >= cumulativeWaypointCount && index < cumulativeWaypointCount + route.waypoints.length) {
                // Calculate the local index within this specific route
                const relativeIndex = index - cumulativeWaypointCount;
                currentWaypoint = route.waypoints[relativeIndex];
                currentRoute = route;
                break;
            }
            cumulativeWaypointCount += route.waypoints.length;
        }

        if (currentWaypoint && currentRoute) {
            // Handle different coordinate formats from different data sources
            const coords = currentWaypoint.coordinates || { lat: currentWaypoint.lat, lng: currentWaypoint.lng };
            
            // Check distance from previous waypoint to determine panning behavior
            let shouldSkipPanning = false;
            let shouldSmoothPanOnly = false;
            const PROXIMITY_THRESHOLD = 10; // meters - skip panning entirely for very close waypoints
            const SMOOTH_PAN_THRESHOLD = 400; // meters - smooth pan only (no zoom) for medium distances
            
            if (prevWaypointRef.current) {
                const distance = calculateDistance(prevWaypointRef.current, coords);
                if (distance < PROXIMITY_THRESHOLD) {
                    shouldSkipPanning = true;
                } else if (distance >= PROXIMITY_THRESHOLD && distance <= SMOOTH_PAN_THRESHOLD) {
                    shouldSmoothPanOnly = true;
                }
            }
            
            // Update the ref with the current waypoint for the next comparison
            prevWaypointRef.current = coords;
            
            setActiveWaypoint(coords);
            setCurrentWaypointIndex(index);
            
            // Check if enough time has passed since demo start to enable cinematic panning
            const timeSinceDemoStart = demoStartTime ? Date.now() - demoStartTime : Infinity;
            
            // Only trigger smooth pan if we're past the initial setup phase AND waypoints are not too close
            if (smoothPanFunction && timeSinceDemoStart > 5000 && !shouldSkipPanning) {
                const autoAdvance = getSetting('autoAdvanceWaypoints');
                if (autoAdvance) {
                    // Auto-advance enabled: Just set map position instantly, no animation
                    smoothPanFunction(coords.lat, coords.lng, currentZoom, false); // false = no cinematic
                    // Notify that panning was skipped (auto-advance mode)
                    if (onPanningSkipped) onPanningSkipped('skipped');
                } else if (shouldSmoothPanOnly) {
                    // Medium distance (11-400m): Smooth pan without zoom/cinematic effects
                    smoothPanFunction(coords.lat, coords.lng, currentZoom, false); // false = no cinematic zoom
                    // Notify that smooth pan only was used
                    if (onPanningSkipped) onPanningSkipped('smooth');
                } else {
                    // Long distance: Full cinematic panning with zoom effects
                    smoothPanFunction(coords.lat, coords.lng, currentZoom, true); // true = cinematic
                }
            } else if (timeSinceDemoStart <= 5000) {
                // Skipping cinematic pan during initial demo period
            } else if (shouldSkipPanning) {
                // Waypoints are too close - skip panning entirely
                if (onPanningSkipped) onPanningSkipped('skipped');
            }
            
            // Update the demo path to show the current route's path
            if (currentRoute.path && currentRoute.path.length > 0) {
                setCurrentDemoPath(currentRoute.path);
            }
        } else {
            console.error('Invalid waypoint index:', index);
            setActiveWaypoint(null);
        }
    }, [structuredRouteData, isInitialDemoSetup, smoothPanFunction, demoStartTime, currentZoom]);

    // ========== AUTHENTICATION HANDLERS ==========
    
    /**
     * Handle successful authentication
     * 
     * Closes the auth modal, creates/updates user document, and updates the UI
     * 
     * @param {Object} user - The authenticated user object from Firebase
     */
    const handleAuthSuccess = useCallback(async (user) => {
        console.log('Authentication successful:', user);
        
        try {
            // Create or update user document in Firestore
            await createUserDocument(user);
            
            // Fetch complete user document with userType
            const userDoc = await getUserDocument(user.uid);
            setUserDocument(userDoc);
            console.log('User document created/updated:', userDoc);
            
            setUser(user);
            setActiveItem('map'); // Close the auth modal and return to map view
        } catch (error) {
            console.error('Error creating user document:', error);
            // Still set user state even if document creation fails
            setUser(user);
            setActiveItem('map');
        }
    }, []);
    
    /**
     * Handle user logout
     * 
     * Signs out the user and updates the UI state.
     * If the user is on their profile page, redirects them to the main map.
     */
    const handleLogout = useCallback(async () => {
        try {
            await signOut(auth);
            setUser(null);
            setUserDocument(null);
            
            // If user is on profile page when logging out, redirect to main map
            if (activeItem === 'profile') {
                setActiveItem('map');
                navigate('/');
            }
            
            console.log('User logged out successfully');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    }, [activeItem, navigate]);
    
    /**
     * Listen for authentication state changes
     * 
     * Monitors Firebase auth state and updates the user state accordingly.
     * Creates user documents for existing users on sign-in.
     */
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            setIsAuthLoading(false);
            
            if (user) {
                console.log('User is signed in:', user);
                
                try {
                    // Ensure user document exists (for existing users or page refresh)
                    await createUserDocument(user);
                    
                    // Fetch complete user document with userType
                    const userDoc = await getUserDocument(user.uid);
                    setUserDocument(userDoc);
                } catch (error) {
                    console.error('Error ensuring user document exists:', error);
                }
            } else {
                console.log('User is signed out');
                setUserDocument(null);
            }
        });
        
        return () => unsubscribe();
    }, []);

    // ========== MEMOIZED VALUES FOR PERFORMANCE ==========
    
    /**
     * Flattened array of all waypoints across all routes
     * 
     * Memoized to prevent unnecessary recalculations when route data doesn't change.
     * Used by demo mode to display all waypoints on the map.
     */
    const memoizedWaypoints = useMemo(() => {
        let allWps = [];
        structuredRouteData.forEach(route => {
            allWps.push(...route.waypoints);
        });
        return allWps;
    }, [structuredRouteData]);
    
    /**
     * Memoized current demo path
     * 
     * Prevents unnecessary re-renders when the path hasn't actually changed.
     */
    const memoizedCurrentDemoPath = useMemo(() => currentDemoPath, [currentDemoPath]);

    /**
     * Memoized map properties object
     * 
     * Constructs the props object passed to the MainMap component.
     * Switches between normal route display and demo mode based on current state.
     */
    const mapProps = useMemo(() => {
        return {
            // Show normal route only when not in demo mode
            activeRoute: (isDemoMode || isZooming) ? null : activeRoute,
            // Show demo path only during demo mode
            activePathForDemo: (isDemoMode || isZooming) ? memoizedCurrentDemoPath : null,
            // Show waypoints only during demo mode
            waypoints: (isDemoMode || isZooming) ? memoizedWaypoints : [],
            // Show active waypoint only during demo mode
            activeWaypoint: (isDemoMode || isZooming) ? activeWaypoint : null,
            mapId: "8a2ac04064bf3833742b72c4",
            zoomLevel: currentZoom,
            isZooming: isZooming,
        };
    }, [isDemoMode, isZooming, activeRoute, memoizedCurrentDemoPath, memoizedWaypoints, activeWaypoint, currentZoom]);

    // ========== RESPONSIVE LAYOUT CALCULATIONS ==========
    
    /**
     * Calculate dynamic layout dimensions based on sidebar state
     */
    const sidebarWidth = isSidebarOpen ? 250 : 70;  // Sidebar width: expanded vs collapsed
    const mainContentStyle = {
        width: `calc(100% - ${sidebarWidth}px)`,     // Adjust content width for sidebar
        position: 'relative',
        left: `${sidebarWidth}px`,                   // Offset content by sidebar width
        transition: 'width 0.3s ease, left 0.3s ease' // Smooth animation when sidebar toggles
    };

    // ========== COMPONENT RENDER ==========
    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* Fixed sidebar with navigation and responsive width */}
            <Sidebar 
                activeItem={activeItem} 
                onSidebarClick={handleSidebarClick}
                onSidebarToggle={handleSidebarToggle}
                user={user}
                userDocument={userDocument}
                onLogout={handleLogout}
            />
            
            {/* Main content area that adjusts to sidebar width */}
            <div style={mainContentStyle}>
                {/* Primary routing for full-page views */}
                <Routes>
                    <Route path="/" element={<MainMap {...mapProps} onSmoothPanReady={handleSmoothPanReady} />} />
                    <Route path="/guides" element={<Guides user={user} />} />
                    <Route path="/profile" element={user ? <Profile user={user} /> : <div>Please log in to view your profile.</div>} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/admin" element={<Admin mapId="8a2ac04064bf3833742b72c4" />} />
                </Routes>
                
                {/* Modal overlay for Explore feature */}
                <Modal isOpen={activeItem === 'explore'} onClose={() => setActiveItem('map')}>
                    <Explore 
                        onSelectRoute={handleRouteSelection} 
                        onStartDemo={handleStartDemo} 
                        user={user}
                        isAuthLoading={isAuthLoading}
                    />
                </Modal>
                
                {/* Modal overlay for Adventures feature */}
                <Modal isOpen={activeItem === 'adventures'} onClose={() => setActiveItem('map')}>
                    <Adventure 
                        onSelectRoute={handleRouteSelection} 
                        onStartDemo={handleStartDemo} 
                        user={user}
                        isAuthLoading={isAuthLoading}
                    />
                </Modal>
                
                {/* Modal overlay for Demo mode with waypoint navigation */}
                <Modal isOpen={isDemoMode} onClose={handleEndDemo}>
                    <DemoView
                        waypoints={memoizedWaypoints}
                        onClose={handleEndDemo}
                        onWaypointChange={handleWaypointChange}
                        currentWaypointIndex={currentWaypointIndex}
                        includeNarration={includeNarration}
                    />
                </Modal>
                
                {/* Modal overlay for Authentication */}
                {activeItem === 'auth' && (
                    <AuthModal onClose={() => setActiveItem('map')}>
                        <Auth onAuthSuccess={handleAuthSuccess} />
                    </AuthModal>
                )}
            </div>
        </div>
    );
};

export default MainContent;