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

import React, { useState, useMemo, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// UI Components
import Sidebar from '../../components/ui/Sidebar';
import Modal from '../../components/ui/Modal';

// Map Components
import MainMap from '../../components/map/MainMap';

// Feature Components
import Explore from '../../components/features/Explore';
import Adventure from '../../components/features/Adventure';
import DemoView from '../../components/features/DemoView';
import Guides from '../../components/features/Guides';
import Settings from '../../components/features/Settings';
import Help from '../../components/features/Help';

// Admin Components
import Admin from '../../components/admin/Admin';

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

        // Validate that we have route data to work with
        if (structuredData.length > 0 && structuredData[0].waypoints.length > 0) {
            const firstWaypoint = structuredData[0].waypoints[0];
            // Handle different coordinate formats
            const coords = firstWaypoint.coordinates || { lat: firstWaypoint.lat, lng: firstWaypoint.lng };
            setActiveWaypoint(coords);
            
            // Set initial demo path if available
            if (structuredData[0].path && structuredData[0].path.length > 0) {
                setCurrentDemoPath(structuredData[0].path);
            }

            setCurrentZoom(17);             // Zoom in close for demo view
            
            // Transition from setup to active demo mode after initial zoom completes
            setTimeout(() => {
                console.log('🔄 Clearing initial demo setup flag - cinematic pan now enabled');
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
     * 
     * @param {number} index - Global waypoint index across all routes
     */
    const handleWaypointChange = useCallback((index) => {
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
            setActiveWaypoint(coords);
            setCurrentWaypointIndex(index);
            
            // Check if enough time has passed since demo start to enable cinematic panning
            const timeSinceDemoStart = demoStartTime ? Date.now() - demoStartTime : Infinity;
            
            // Only trigger smooth pan if we're past the initial setup phase
            if (smoothPanFunction && timeSinceDemoStart > 5000) {
                console.log('✨ MainContent calling CINEMATIC PAN with waypoint:', currentWaypoint.name, 'coords:', coords.lat, coords.lng);
                smoothPanFunction(coords.lat, coords.lng, currentZoom, true);
            } else if (timeSinceDemoStart <= 5000) {
                console.log('🚫 Skipping cinematic pan during initial demo period');
            }
            
            // Update the demo path to show the current route's path
            if (currentRoute.path && currentRoute.path.length > 0) {
                setCurrentDemoPath(currentRoute.path);
            }
        } else {
            console.error('Invalid waypoint index:', index);
            setActiveWaypoint(null);
        }
    }, [structuredRouteData, isInitialDemoSetup]);

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
            />
            
            {/* Main content area that adjusts to sidebar width */}
            <div style={mainContentStyle}>
                {/* Primary routing for full-page views */}
                <Routes>
                    <Route path="/" element={<MainMap {...mapProps} onSmoothPanReady={handleSmoothPanReady} />} />
                    <Route path="/guides" element={<Guides />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/admin" element={<Admin mapId="8a2ac04064bf3833742b72c4" />} />
                </Routes>
                
                {/* Modal overlay for Explore feature */}
                {activeItem === 'explore' && (
                    <Modal onClose={() => setActiveItem('map')}>
                        <Explore onSelectRoute={handleRouteSelection} onStartDemo={handleStartDemo} />
                    </Modal>
                )}
                
                {/* Modal overlay for Adventures feature */}
                {activeItem === 'adventures' && (
                    <Modal onClose={() => setActiveItem('map')}>
                        <Adventure onSelectRoute={handleRouteSelection} onStartDemo={handleStartDemo} />
                    </Modal>
                )}
                
                {/* Modal overlay for Demo mode with waypoint navigation */}
                {isDemoMode && (
                    <Modal onClose={handleEndDemo}>
                        <DemoView
                            waypoints={memoizedWaypoints}
                            onClose={handleEndDemo}
                            onWaypointChange={handleWaypointChange}
                            currentWaypointIndex={currentWaypointIndex}
                            includeNarration={includeNarration}
                        />
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default MainContent;