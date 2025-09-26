import React, { useState, useMemo, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

import Sidebar from '../../components/ui/Sidebar';
import MainMap from '../../components/map/MainMap';
import Modal from '../../components/ui/Modal';
import Explore from '../../components/features/Explore';
import Adventure from '../../components/features/Adventure';
import Admin from '../../components/admin/Admin';
import DemoView from '../../components/features/DemoView';
import Guides from '../../components/features/Guides';
import Settings from '../../components/features/Settings';
import Help from '../../components/features/Help';

const MainContent = () => {
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState('map');
    const [activeRoute, setActiveRoute] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(3);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [isZooming, setIsZooming] = useState(false);
    const [activeWaypoint, setActiveWaypoint] = useState(null);
    const [currentZoom, setCurrentZoom] = useState(3);
    const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);

    const [structuredRouteData, setStructuredRouteData] = useState([]);
    const [currentDemoPath, setCurrentDemoPath] = useState([]);
    const [smoothPanFunction, setSmoothPanFunction] = useState(null);
    const [isInitialDemoSetup, setIsInitialDemoSetup] = useState(false);
    const [demoStartTime, setDemoStartTime] = useState(null);
    
    const handleSidebarClick = useCallback((item, path) => {
        if (isDemoMode || isZooming) {
            setStructuredRouteData([]);
            setIsDemoMode(false);
            setIsZooming(false);
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
        setIsZooming(true);
        setIsInitialDemoSetup(true);
        setDemoStartTime(Date.now());
        setStructuredRouteData(structuredData);
        setCurrentWaypointIndex(0);
        setCurrentDemoPath([]);

        if (structuredData.length > 0 && structuredData[0].waypoints.length > 0) {
            const firstWaypoint = structuredData[0].waypoints[0];
            const coords = firstWaypoint.coordinates || { lat: firstWaypoint.lat, lng: firstWaypoint.lng };
            setActiveWaypoint(coords);
            if (structuredData[0].path && structuredData[0].path.length > 0) {
                setCurrentDemoPath(structuredData[0].path);
            }

            setCurrentZoom(17);
            
            setTimeout(() => {
                console.log('🔄 Clearing initial demo setup flag - cinematic pan now enabled');
                setIsZooming(false);
                setIsInitialDemoSetup(false);
                setIsDemoMode(true);
            }, 4000);

        } else {
            console.warn("No waypoints found to start a demo.");
        }
    }, [currentZoom]);

    const handleEndDemo = useCallback(() => {
        setStructuredRouteData([]);
        setIsDemoMode(false);
        setIsZooming(false);
        setActiveWaypoint(null);
        setCurrentDemoPath([]);
        setCurrentZoom(3);
        setCurrentWaypointIndex(0);
        setActiveRoute(null);
    }, []);

    const handleSmoothPanReady = useCallback((panFunction) => {
        setSmoothPanFunction(() => panFunction);
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
            
            const timeSinceDemoStart = demoStartTime ? Date.now() - demoStartTime : Infinity;
            
            if (smoothPanFunction && timeSinceDemoStart > 5000) {
                console.log('✨ MainContent calling CINEMATIC PAN with waypoint:', currentWaypoint.name, 'coords:', coords.lat, coords.lng);
                smoothPanFunction(coords.lat, coords.lng, currentZoom, true);
            } else if (timeSinceDemoStart <= 5000) {
                console.log('🚫 Skipping cinematic pan during initial demo period');
            }
            
            if (currentRoute.path && currentRoute.path.length > 0) {
                setCurrentDemoPath(currentRoute.path);
            }
        } else {
            console.error('Invalid waypoint index:', index);
            setActiveWaypoint(null);
        }
    }, [structuredRouteData, isInitialDemoSetup]);

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
            activeRoute: (isDemoMode || isZooming) ? null : activeRoute,
            activePathForDemo: (isDemoMode || isZooming) ? memoizedCurrentDemoPath : null,
            waypoints: (isDemoMode || isZooming) ? memoizedWaypoints : [],
            activeWaypoint: (isDemoMode || isZooming) ? activeWaypoint : null,
            mapId: "8a2ac04064bf3833742b72c4",
            zoomLevel: currentZoom,
            isZooming: isZooming,
        };
    }, [isDemoMode, isZooming, activeRoute, memoizedCurrentDemoPath, memoizedWaypoints, activeWaypoint, currentZoom]);

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar activeItem={activeItem} onSidebarClick={handleSidebarClick} />
            <div style={{ width: 'calc(100% - 70px)', position: 'relative', left: '70px'  }}>
                <Routes>
                    <Route path="/" element={<MainMap {...mapProps} onSmoothPanReady={handleSmoothPanReady} />} />
                    <Route path="/guides" element={<Guides />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/help" element={<Help />} />
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