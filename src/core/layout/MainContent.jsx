import React, { useState, useMemo, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/ui/Sidebar';
import MainMap from '../../components/map/MainMap';
import Modal from '../../components/ui/Modal';
import Explore from '../../components/features/Explore';
import Adventure from '../../components/features/Adventure';
import Admin from '../../components/features/Admin';
import DemoView from '../../components/features/DemoView';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";

const MainContent = () => {
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState('map');
    const [activeRoute, setActiveRoute] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(3);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [activeWaypoint, setActiveWaypoint] = useState(null);
    const [currentZoom, setCurrentZoom] = useState(3);
    const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);

    const [structuredRouteData, setStructuredRouteData] = useState([]);
    const [currentDemoPath, setCurrentDemoPath] = useState([]);
    
    const handleSidebarClick = useCallback((item, path) => {
        if (isDemoMode) {
            setStructuredRouteData([]);
            setIsDemoMode(false);
            setActiveWaypoint(null);
            setCurrentDemoPath([]);
            setCurrentZoom(3);
            setCurrentWaypointIndex(0);
        }

        if (item !== 'map') {
            setActiveRoute(null);
            setStructuredRouteData([]);
            setCurrentDemoPath([]);
        }
        if (path === '/' && item === 'map') {
            setActiveRoute(null);
            setZoomLevel(3);
        }
        setActiveItem(item);
        navigate(path);
    }, [navigate, isDemoMode]);

    const handleRouteSelection = useCallback((routeData) => {
        setActiveRoute(routeData);
        setActiveWaypoint(null);
        setStructuredRouteData([]);
        setCurrentDemoPath([]);
        setCurrentZoom(3);
    }, []);

    const handleStartDemo = useCallback((structuredData) => {
        setActiveRoute(null);
        setIsDemoMode(true);
        setCurrentZoom(17);
        setStructuredRouteData(structuredData);
        setCurrentWaypointIndex(0);
        setCurrentDemoPath([]);

        if (structuredData.length > 0 && structuredData[0].waypoints.length > 0) {
            const firstWaypoint = structuredData[0].waypoints[0];
            const coords = firstWaypoint.coordinates || { lat: firstWaypoint.lat, lng: firstWaypoint.lng };
            setActiveWaypoint(coords);
            if (structuredData[0].path && structuredData[0].path.length > 0) {
                console.log('First route path:', structuredData[0].path);
                setCurrentDemoPath(structuredData[0].path);
            }
        } else {
            console.warn("No waypoints found to start a demo.");
        }
    }, []);

    const handleEndDemo = useCallback(() => {
        setStructuredRouteData([]);
        setIsDemoMode(false);
        setActiveWaypoint(null);
        setCurrentDemoPath([]);
        setCurrentZoom(3);
        setCurrentWaypointIndex(0);
        setActiveRoute(null);
    }, []);

    const handleWaypointChange = useCallback((index) => {
        let cumulativeWaypointCount = 0;
        let currentWaypoint = null;
        let currentRoute = null;

        for (const route of structuredRouteData) {
            if (index >= cumulativeWaypointCount && index < cumulativeWaypointCount + route.waypoints.length) {
                const relativeIndex = index - cumulativeWaypointCount;
                currentWaypoint = route.waypoints[relativeIndex];
                currentRoute = route;
                break;
            }
            cumulativeWaypointCount += route.waypoints.length;
        }

        if (currentWaypoint && currentRoute) {
            const coords = currentWaypoint.coordinates || { lat: currentWaypoint.lat, lng: currentWaypoint.lng };
            setActiveWaypoint(coords);
            setCurrentWaypointIndex(index);
            
            console.log('Current route:', currentRoute);
            console.log('Current waypoint:', currentWaypoint);
            console.log('Full path:', currentRoute.path);
            
            if (currentRoute.path && currentRoute.path.length > 0) {
                setCurrentDemoPath(currentRoute.path);
            }

            console.log(`Updated path for waypoint at index ${index}. Using full route path.`);
        } else {
            console.error('Invalid waypoint index:', index);
            setActiveWaypoint(null);
        }
    }, [structuredRouteData]);

    const memoizedWaypoints = useMemo(() => {
        let allWps = [];
        structuredRouteData.forEach(route => {
            allWps.push(...route.waypoints);
        });
        return allWps;
    }, [structuredRouteData]);
    
    const memoizedCurrentDemoPath = useMemo(() => currentDemoPath, [currentDemoPath]);

    const mapProps = useMemo(() => {
        return {
            activeRoute: isDemoMode ? null : activeRoute,
            activePathForDemo: isDemoMode ? memoizedCurrentDemoPath : null,
            waypoints: isDemoMode ? memoizedWaypoints : [],
            activeWaypoint: isDemoMode ? activeWaypoint : null,
            mapId: "8a2ac04064bf3833742b72c4",
            zoomLevel: currentZoom,
        };
    }, [isDemoMode, activeRoute, memoizedCurrentDemoPath, memoizedWaypoints, activeWaypoint, currentZoom]);

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar activeItem={activeItem} onSidebarClick={handleSidebarClick} />
            <div style={{ width: 'calc(100% - 70px)', position: 'relative', left: '70px'  }}>
                <Routes>
                    <Route path="/" element={<MainMap {...mapProps} />} />
                    <Route path="/guides" element={<div>Guides/Safety Page</div>} />
                    <Route path="/settings" element={<div>Settings Page</div>} />
                    <Route path="/help" element={<div>Help Page</div>} />
                    <Route path="/admin" element={<Admin mapId="8a2ac04064bf3833742b72c4" />} />
                </Routes>
                {activeItem === 'explore' && (
                    <Modal onClose={() => setActiveItem('map')}>
                        <Explore onSelectRoute={handleRouteSelection} onStartDemo={handleStartDemo} />
                    </Modal>
                )}
                {activeItem === 'adventures' && (
                    <Modal onClose={() => setActiveItem('map')}>
                        <Adventure onSelectRoute={handleRouteSelection} onStartDemo={handleStartDemo} />
                    </Modal>
                )}
                {isDemoMode && (
                    <Modal onClose={handleEndDemo}>
                        <DemoView
                            waypoints={memoizedWaypoints}
                            onClose={handleEndDemo}
                            onWaypointChange={handleWaypointChange}
                            currentWaypointIndex={currentWaypointIndex}
                        />
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default MainContent;