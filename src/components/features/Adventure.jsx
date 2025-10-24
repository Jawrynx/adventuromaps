/**
 * Adventure.jsx - Adventure activities browser and launcher
 * 
 * This component provides a comprehensive interface for browsing and interacting with
 * published adventure activities. It displays adventure cards with detailed information,
 * supports route viewing and demo mode launching, and handles complex data fetching
 * from Firestore's hierarchical structure (adventures -> routes -> waypoints).
 */

import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faChevronDown, faEllipsisV, faChevronUp, faHatCowboySide } from '@fortawesome/free-solid-svg-icons';

// Firebase services
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";

// Settings service
import { getSetting } from "../../services/settingsService";
import { useSettings } from "../../services/SettingsContext.jsx";

/**
 * Adventure Component
 * 
 * Displays published adventure activities with rich interaction capabilities:
 * - Fetches and displays adventure cards with images and details
 * - Supports expandable cards with additional information
 * - Launches route display mode for map viewing
 * - Launches interactive demo mode with waypoint navigation
 * 
 * @param {Function} onSelectRoute - Callback to display route on map
 * @param {Function} onStartDemo - Callback to start interactive demo mode
 * @returns {JSX.Element} Adventure browser interface
 */
function Adventure({ onSelectRoute, onStartDemo }) {
  // ========== COMPONENT STATE ==========
  const [showMore, setShowMore] = useState({});     // Tracks which adventure cards are expanded
  const [adventures, setAdventures] = useState([]); // Array of published adventure data
  const [loading, setLoading] = useState(true);     // Loading state for data fetching
  const [showOptions, setShowOptions] = useState({}); // Tracks which option menus are open
  const [includeNarration, setIncludeNarration] = useState({}); // Tracks narration preference for each item  
  const optionsMenuRef = useRef(null); // Ref for options menu to handle outside clicks
  const { settingsVersion } = useSettings(); // Listen for settings changes

  /**
   * Fetches published adventures from Firestore on component mount
   * 
   * Retrieves all adventures with 'published' status and stores them
   * in local state for display in the adventure browser.
   */
  useEffect(() => {
    const getAdventures = async () => {
      try {
        // Query for published adventures only
        const adventuresCollection = collection(db, "adventure");
        const q = query(adventuresCollection, where("status", "==", "published"));
        const querySnapshot = await getDocs(q);

        // Transform Firestore documents to usable data objects
        const fetchedAdventures = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setAdventures(fetchedAdventures);

        // Initialize narration preferences based on default setting
        const defaultNarration = getSetting('defaultNarrationEnabled');
        const initialNarrationState = {};
        fetchedAdventures.forEach(adventure => {
          initialNarrationState[adventure.id] = defaultNarration;
        });
        setIncludeNarration(initialNarrationState);

      } catch (error) {
        console.error("Error fetching adventures:", error);
      } finally {
        setLoading(false);
      }
    };

    getAdventures();
  }, []);

  /**
   * Updates narration preferences when settings change
   * 
   * Listens for settings changes and updates the narration checkboxes
   * to reflect the current default narration setting.
   */
  useEffect(() => {
    if (adventures.length > 0) {
      const defaultNarration = getSetting('defaultNarrationEnabled');
      const updatedNarrationState = {};
      adventures.forEach(adventure => {
        // Only update if not already set by user preference
        updatedNarrationState[adventure.id] = includeNarration[adventure.id] !== undefined 
          ? includeNarration[adventure.id] 
          : defaultNarration;
      });
      setIncludeNarration(updatedNarrationState);
    }
  }, [settingsVersion, adventures]);

  /**
   * Toggles the expanded/collapsed state for an adventure card
   * 
   * Manages the "show more" functionality that allows users to
   * view additional details about an adventure by expanding its card.
   * 
   * @param {string} itemId - The unique ID of the adventure to toggle
   */
  const toggleShowMore = (itemId) => {
    setShowMore(prevShowMore => ({
      ...prevShowMore,
      [itemId]: !prevShowMore[itemId]
    }));
  };

  /**
   * Toggles the options menu for an adventure card
   * 
   * Shows/hides the options menu containing demo preferences
   * like narration inclusion settings.
   * 
   * @param {string} itemId - The unique ID of the adventure to toggle options for
   */
  const toggleOptions = (itemId) => {

    setShowOptions(prevShowOptions => ({
      ...prevShowOptions,
      [itemId]: !prevShowOptions[itemId]
    }));
  };

  /**
   * Handles narration preference toggle for an adventure
   * 
   * Updates the narration inclusion setting for demo mode.
   * This preference will be passed to DemoView when starting a demo.
   * 
   * @param {string} itemId - The unique ID of the adventure
   * @param {boolean} enabled - Whether to include narration in demo
   */
  const handleNarrationToggle = (itemId, enabled) => {
    setIncludeNarration(prevState => ({
      ...prevState,
      [itemId]: enabled
    }));
  };

  /**
   * Handles launching demo mode for an adventure
   * 
   * Fetches complete route and waypoint data for the selected adventure
   * and structures it for demo mode. Validates that sufficient data exists
   * before launching the interactive demo experience.
   * 
   * @param {Object} adventureData - Adventure object with id and metadata
   */
  const handleDemoClick = async (adventureData) => {
    try {
      // Fetch all routes for this adventure in proper order
      const routesCollectionRef = collection(db, "adventure", adventureData.id, "routes");
      const routesQuery = query(routesCollectionRef, orderBy("order"));
      const routesSnapshot = await getDocs(routesQuery);

      const structuredRoutes = [];

      // Process each route and fetch its waypoints
      for (const routeDoc of routesSnapshot.docs) {
        const routeId = routeDoc.id;
        const routeData = routeDoc.data();

        // Fetch waypoints for this specific route
        const waypointsCollectionRef = collection(db, "adventure", adventureData.id, "routes", routeId, "waypoints");
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
          includeNarration: includeNarration[adventureData.id] || false
        };
        onStartDemo(demoOptions);
      } else {
        // Inform user that demo cannot be started
        console.warn("No waypoints or path found for this adventure.");
        alert("No waypoints or path found to start a demo.");
      }
    } catch (error) {
      // Handle any errors during data fetching
      console.error("Error fetching demo data:", error);
      alert("Error loading demo data. Please check the console for details.");
    }
  };

  /**
   * Handles route viewing for an adventure
   * 
   * Fetches route coordinate data and displays it on the map.
   * This provides a static view of the adventure path without
   * interactive waypoint navigation.
   * 
   * @param {Object} adventureData - Adventure object with id and metadata
   */
  const handleRouteClick = async (adventureData) => {
    try {
      // Fetch routes for map display
      const routesCollectionRef = collection(db, "adventure", adventureData.id, "routes");
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

  // ========== LOADING AND EMPTY STATES ==========
  if (loading) {
    return (
      <div id='adventure'>
        <p>Loading adventures...</p>
      </div>
    );
  }

  if (adventures.length === 0) {
    return (
      <div id='adventure'>
        <h1>Adventure</h1>
        <p>No published adventures found.</p>
      </div>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <div id='adventure'>
      <h1>Adventure <FontAwesomeIcon icon={faHatCowboySide} /></h1>
      <ul>
        {adventures.map(item => (
          <li key={item.id} className={`adventure-item ${showMore[item.id] ? 'item-expanded' : ''}`} onClick={() => handleRouteClick(item)}>
            {/* Adventure card image */}
            <img src={item.image_url} alt={item.name} width='100%' height='100px' className='adventure-image' />
            
            {/* Basic adventure information */}
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            
            {/* Expandable additional details */}
            <div className={`adventure-more-container ${showMore[item.id] ? 'expanded' : ''}`}>
              <div className="adventure-more">
                <div className="route-info">
                  <h3>Route Summary</h3>
                  <p className='long-description'>{item.subDescription}</p>
                  
                  {/* Key locations list */}
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
                  
                  {/* Estimated time */}
                  {item.estimatedTime && (
                    <div className="route-estimated-time">
                      <h3>Estimated Time</h3>
                      <p>{item.estimatedTime}</p>
                    </div>
                  )}
                  
                  {/* Difficulty level */}
                  {item.difficulty && (
                    <div className="route-difficulty">
                      <h3>Difficulty Level</h3>
                      <p>{item.difficulty === 'easy' ? 'Easy' : item.difficulty === 'medium' ? 'Medium' : 'Hard'}</p>
                    </div>
                  )}
                </div>
                
                {/* Topics/categories covered */}
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
            
            {/* Action buttons */}
            <div className="adventure-buttons">
              {/* Expand/collapse button */}
              <button className='more-button' onClick={(e) => { e.stopPropagation(); toggleShowMore(item.id); }}>
                <FontAwesomeIcon icon={showMore[item.id] ? faChevronUp : faChevronDown} />
              </button>
              
              {/* Demo launch button */}
              <button className='demo-button' onClick={(e) => { e.stopPropagation(); handleDemoClick(item); }}>
                <FontAwesomeIcon icon={faPlay} />
              </button>
              
              {/* Options menu button */}
              <button className='options-button' onClick={(e) => { e.stopPropagation(); toggleOptions(item.id); }}>
                <FontAwesomeIcon icon={faEllipsisV} />
              </button>
            </div>

            {/* Options Menu */}
            <div className={`options-menu ${showOptions[item.id] ? 'options-menu-open' : 'options-menu-closed'}`} ref={optionsMenuRef} onClick={(e) => e.stopPropagation()}>
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

export default Adventure;