import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faChevronDown, faEllipsisV, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";

function Explore({ onSelectRoute, onStartDemo }) {
    const [showMore, setShowMore] = useState({});
    const [explorations, setExplorations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getExplorations = async () => {
            try {
                const explorationsCollection = collection(db, "exploration");
                const q = query(explorationsCollection, where("status", "==", "published"));
                const querySnapshot = await getDocs(q);

                const fetchedExplorations = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setExplorations(fetchedExplorations);
            } catch (error) {
                console.error("Error fetching explorations:", error);
            } finally {
                setLoading(false);
            }
        };

        getExplorations();
    }, []);

    const toggleShowMore = (itemId) => {
        setShowMore(prevShowMore => ({
            ...prevShowMore,
            [itemId]: !prevShowMore[itemId]
        }));
    };

    const handleDemoClick = async (explorationData) => {
        try {
            const routesCollectionRef = collection(db, "exploration", explorationData.id, "routes");
            const routesQuery = query(routesCollectionRef, orderBy("order"));
            const routesSnapshot = await getDocs(routesQuery);

            const structuredRoutes = [];

            for (const routeDoc of routesSnapshot.docs) {
                const routeId = routeDoc.id;
                const routeData = routeDoc.data();

                const waypointsCollectionRef = collection(db, "exploration", explorationData.id, "routes", routeId, "waypoints");
                const waypointsQuery = query(waypointsCollectionRef, orderBy("order"));
                const waypointsSnapshot = await getDocs(waypointsQuery);

                const routeWaypoints = waypointsSnapshot.docs.map(waypointDoc => ({
                    id: waypointDoc.id,
                    ...waypointDoc.data()
                }));

                const routePath = Array.isArray(routeData.coordinates) ? routeData.coordinates : [];
                
                structuredRoutes.push({
                    id: routeId,
                    waypoints: routeWaypoints,
                    path: routePath
                });
            }

            console.log('Structured Routes', structuredRoutes);

            const hasWaypoints = structuredRoutes.some(route => route.waypoints.length > 0);
            const hasPath = structuredRoutes.some(route => route.path.length > 0);

            if (hasWaypoints && hasPath) {
                onStartDemo(structuredRoutes);
            } else {
                console.warn("No waypoints or path found for this exploration.");
                alert("No waypoints or path found to start a demo.");
            }
        } catch (error) {
            console.error("Error fetching demo data:", error);
            alert("Error loading demo data. Please check the console for details.");
        }
    };

    const handleRouteClick = async (explorationData) => {
        try {
            const routesCollectionRef = collection(db, "exploration", explorationData.id, "routes");
            const q = query(routesCollectionRef, orderBy("order"));
            const routesSnapshot = await getDocs(q);

            const fetchedRoutes = routesSnapshot.docs.map(doc => doc.data().coordinates);
            const flattenedCoordinates = fetchedRoutes.flat();
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
            <h1>Exploration</h1>
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
                            <button className='options-button' onClick={(e) => { e.stopPropagation(); }}><FontAwesomeIcon icon={faEllipsisV} /></button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Explore;