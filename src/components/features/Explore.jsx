/**
 * Explore.jsx - Exploration activities browser and launcher
 * 
 * This component provides an interface for discovering and interacting with
 * published exploration activities. Similar to Adventure component but focused
 * on exploration-type content with different data structures and user flows.
 * Supports route viewing and demo mode launching for exploration activities.
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faChevronDown, faEllipsisV, faChevronUp, faCompass } from '@fortawesome/free-solid-svg-icons';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";

// Settings service
import { getSetting } from "../../services/settingsService";
import { useSettings } from "../../services/SettingsContext.jsx";

/**
 * Explore Component
 * 
 * Displays published exploration activities with interaction capabilities:
 * - Fetches and displays exploration cards with images and details
 * - Supports expandable cards for additional information
 * - Launches route display mode for map viewing
 * - Launches interactive demo mode with waypoint navigation
 * 
 * @param {Function} onSelectRoute - Callback to display route on map
 * @param {Function} onStartDemo - Callback to start interactive demo mode
 * @returns {JSX.Element} Exploration browser interface
 */
function Explore({ onSelectRoute, onStartDemo }) {
    // ========== COMPONENT STATE ==========
    const [showMore, setShowMore] = useState({});       // Tracks which exploration cards are expanded
    const [explorations, setExplorations] = useState([]); // Array of published exploration data
    const [loading, setLoading] = useState(true);        // Loading state for data fetching
    const [showOptions, setShowOptions] = useState({}); // Tracks which option menus are open
    const [includeNarration, setIncludeNarration] = useState({}); // Tracks narration preference for each item
    const { settingsVersion } = useSettings(); // Listen for settings changes

    /**
     * Fetches published explorations from Firestore on component mount
     * 
     * Retrieves all exploration activities with 'published' status and stores them
     * in local state for display in the exploration browser.
     */
    useEffect(() => {
        const getExplorations = async () => {
            try {
                // Query for published explorations only
                const explorationsCollection = collection(db, "exploration");
                const q = query(explorationsCollection, where("status", "==", "published"));
                const querySnapshot = await getDocs(q);

                // Transform Firestore documents to usable data objects
                const fetchedExplorations = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setExplorations(fetchedExplorations);

                // Initialize narration preferences based on default setting
                const defaultNarration = getSetting('defaultNarrationEnabled');
                const initialNarrationState = {};
                fetchedExplorations.forEach(exploration => {
                    initialNarrationState[exploration.id] = defaultNarration;
                });
                setIncludeNarration(initialNarrationState);

            } catch (error) {
                console.error("Error fetching explorations:", error);
            } finally {
                setLoading(false);
            }
        };

        getExplorations();
    }, []);

    /**
     * Updates narration preferences when settings change
     * 
     * Listens for settings changes and updates the narration checkboxes
     * to reflect the current default narration setting.
     */
    useEffect(() => {
        if (explorations.length > 0) {
            const defaultNarration = getSetting('defaultNarrationEnabled');
            const updatedNarrationState = {};
            explorations.forEach(exploration => {
                // Only update if not already set by user preference
                updatedNarrationState[exploration.id] = includeNarration[exploration.id] !== undefined 
                    ? includeNarration[exploration.id] 
                    : defaultNarration;
            });
            setIncludeNarration(updatedNarrationState);
        }
    }, [settingsVersion, explorations]);

    /**
     * Toggles the expanded/collapsed state for an exploration card
     * 
     * Manages the "show more" functionality that allows users to
     * view additional details about an exploration by expanding its card.
     * 
     * @param {string} itemId - The unique ID of the exploration to toggle
     */
    const toggleShowMore = (itemId) => {
        setShowMore(prevShowMore => ({
            ...prevShowMore,
            [itemId]: !prevShowMore[itemId]
        }));
    };

    /**
     * Toggles the options menu for an exploration card
     * 
     * Shows/hides the options menu containing demo preferences
     * like narration inclusion settings.
     * 
     * @param {string} itemId - The unique ID of the exploration to toggle options for
     */
    const toggleOptions = (itemId) => {
        setShowOptions(prevShowOptions => ({
            ...prevShowOptions,
            [itemId]: !prevShowOptions[itemId]
        }));
    };

    /**
     * Handles narration preference toggle for an exploration
     * 
     * Updates the narration inclusion setting for demo mode.
     * This preference will be passed to DemoView when starting a demo.
     * 
     * @param {string} itemId - The unique ID of the exploration
     * @param {boolean} enabled - Whether to include narration in demo
     */
    const handleNarrationToggle = (itemId, enabled) => {
        setIncludeNarration(prevState => ({
            ...prevState,
            [itemId]: enabled
        }));
    };

    /**
     * Handles launching demo mode for an exploration
     * 
     * Fetches complete route and waypoint data for the selected exploration
     * and structures it for demo mode. Validates that sufficient data exists
     * before launching the interactive demo experience.
     * 
     * @param {Object} explorationData - Exploration object with id and metadata
     */
    const handleDemoClick = async (explorationData) => {
        try {
            // Fetch all routes for this exploration in proper order
            const routesCollectionRef = collection(db, "exploration", explorationData.id, "routes");
            const routesQuery = query(routesCollectionRef, orderBy("order"));
            const routesSnapshot = await getDocs(routesQuery);

            const structuredRoutes = [];

            // Process each route and fetch its waypoints
            for (const routeDoc of routesSnapshot.docs) {
                const routeId = routeDoc.id;
                const routeData = routeDoc.data();

                // Fetch waypoints for this specific route
                const waypointsCollectionRef = collection(db, "exploration", explorationData.id, "routes", routeId, "waypoints");
                const waypointsQuery = query(waypointsCollectionRef, orderBy("order"));
                const waypointsSnapshot = await getDocs(waypointsQuery);

                // Structure waypoint data with IDs
                const routeWaypoints = waypointsSnapshot.docs.map(waypointDoc => ({
                    id: waypointDoc.id,
                    ...waypointDoc.data()
                }));

                // Extract route path coordinates, ensuring array format
                const routePath = Array.isArray(routeData.coordinates) ? routeData.coordinates : [];
                
                // Build complete route structure for demo
                structuredRoutes.push({
                    id: routeId,
                    waypoints: routeWaypoints,
                    path: routePath
                });
            }


            // Validate that we have sufficient data for demo mode
            const hasWaypoints = structuredRoutes.some(route => route.waypoints.length > 0);
            const hasPath = structuredRoutes.some(route => route.path.length > 0);

            // Only start demo if we have both waypoints and route paths
            if (hasWaypoints && hasPath) {
                const demoOptions = {
                    routes: structuredRoutes,
                    includeNarration: includeNarration[explorationData.id] || false
                };
                onStartDemo(demoOptions);
            } else {
                // Inform user that demo cannot be started
                console.warn("No waypoints or path found for this exploration.");
                alert("No waypoints or path found to start a demo.");
            }
        } catch (error) {
            // Handle any errors during data fetching
            console.error("Error fetching demo data:", error);
            alert("Error loading demo data. Please check the console for details.");
        }
    };

    /**
     * Handles route viewing for an exploration
     * 
     * Fetches route coordinate data and displays it on the map.
     * This provides a static view of the exploration path without
     * interactive waypoint navigation.
     * 
     * @param {Object} explorationData - Exploration object with id and metadata
     */
    const handleRouteClick = async (explorationData) => {
        try {
            // Fetch routes for map display
            const routesCollectionRef = collection(db, "exploration", explorationData.id, "routes");
            const q = query(routesCollectionRef, orderBy("order"));
            const routesSnapshot = await getDocs(q);

            // Extract and flatten coordinate arrays
            const fetchedRoutes = routesSnapshot.docs.map(doc => doc.data().coordinates);
            const flattenedCoordinates = fetchedRoutes.flat();
            
            // Display route on map
            onSelectRoute(flattenedCoordinates);
        } catch (error) {
            console.error("Error fetching route subcollection:", error);
        }
    };

    if (loading) {
        return (
            <div id='explore'>
                <p>Loading explorations...</p>
            </div>
        );
    }

    if (explorations.length === 0) {
        return (
            <div id='explore'>
                <p>No published explorations found.</p>
            </div>
        );
    }

    return (
        <div id='explore'>
            <h1>Exploration <FontAwesomeIcon icon={faCompass} /></h1>
            <ul>
                {explorations.map(item => (
                    <li key={item.id} className='explore-item' onClick={() => handleRouteClick(item)}>
                        <img src={item.image_url} alt={item.name} width='100%' height='100px' className='explore-image' />
                        <h2>{item.name}</h2>
                        <p>{item.description}</p>
                        <div className={`explore-more-container ${showMore[item.id] ? 'expanded' : ''}`}>
                            <div className="explore-more">
                                <div className="route-info">
                                    <h3>Route Summary</h3>
                                    <p>{item.subDescription}</p>
                                    {item.keyLocations && (
                                        <div className="route-locations">
                                            <h3>Key Locations</h3>
                                            <ul>
                                                {item.keyLocations.map((location, index) => (
                                                    <li key={index}>{location}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {item.estimatedTime && (
                                        <>
                                            <h3>Estimated Time</h3>
                                            <p>{item.estimatedTime}</p>
                                        </>
                                    )}
                                </div>
                                {item.categories && (
                                    <div className="route-topics">
                                        <h3>Topics Covered</h3>
                                        <ul>
                                            {item.categories.map((category, index) => (
                                                <li key={index}>{category}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="explore-buttons">
                            <button className='more-button' onClick={(e) => { e.stopPropagation(); toggleShowMore(item.id); }}>
                                <FontAwesomeIcon icon={showMore[item.id] ? faChevronUp : faChevronDown} />
                            </button>
                            <button className='demo-button' onClick={(e) => { e.stopPropagation(); handleDemoClick(item); }}>
                                <FontAwesomeIcon icon={faPlay} />
                            </button>
                            <button className='options-button' onClick={(e) => { e.stopPropagation(); toggleOptions(item.id); }}>
                                <FontAwesomeIcon icon={faEllipsisV} />
                            </button>
                        </div>

                        {/* Options Menu */}
                        <div className={`options-menu ${showOptions[item.id] ? 'options-menu-open' : 'options-menu-closed'}`} onClick={(e) => e.stopPropagation()}>
                            <div className="option-item">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={includeNarration[item.id] || false}
                                        onChange={(e) => handleNarrationToggle(item.id, e.target.checked)}
                                    />
                                    Include Narration
                                </label>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Explore;