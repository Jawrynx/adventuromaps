import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainMap from './components/MainMap';
import Modal from './components/Modal';
import Explore from './components/Explore';
import Adventure from './components/Adventure';
import Admin from './components/Admin';

const MainContent = () => {
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState('map');
    const [activeRoute, setActiveRoute] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(3);

    const handleSidebarClick = (item, path) => {
        if (item !== 'map') {
            setActiveRoute(null); // Clears any active route when not on the map
        }


        // Reset map view when navigating back to map and remove polylines
        if (path === '/' && item === 'map') {
            setActiveRoute(null);
            setZoomLevel(3);
        }
        
        setActiveItem(item);
        navigate(path);
    };

    const handleRouteSelection = (routeData) => {
        setActiveRoute(routeData);
    }

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar
                activeItem={activeItem}
                onSidebarClick={handleSidebarClick}
            />
            <div style={{ flexGrow: 1 }}>
                <Routes>
                    <Route path="/" element={<MainMap activeRoute={activeRoute} mapId="8a2ac04064bf3833742b72c4" zoomLevel={zoomLevel} />} />
                    <Route path="/guides" element={<div>Guides/Safety Page</div>} />
                    <Route path="/settings" element={<div>Settings Page</div>} />
                    <Route path="/help" element={<div>Help Page</div>} />
                    <Route path="/admin" element={<Admin mapId="8a2ac04064bf3833742b72c4" />} />
                </Routes>
                {activeItem === 'explore' && (
                    <Modal onClose={() => setActiveItem('map')}>
                        <Explore onSelectRoute={handleRouteSelection} />
                    </Modal>
                )}
                {activeItem === 'adventures' && (
                    <Modal onClose={() => setActiveItem('map')}>
                        <Adventure />
                    </Modal>
                )}
            </div>
        </div>
    );
};

export default MainContent;