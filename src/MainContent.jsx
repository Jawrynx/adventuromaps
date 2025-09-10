import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainMap from './components/MainMap';
import Modal from './components/Modal';
import Explore from './components/Explore';
import Adventure from './components/Adventure';



const MainContent = () => {
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState('map');

    const handleSidebarClick = (item, path) => {
        setActiveItem(item);
        navigate(path);
    };

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            <Sidebar
                activeItem={activeItem}
                onSidebarClick={handleSidebarClick}
            />
            <div style={{ flexGrow: 1 }}>
                <Routes>
                    <Route path="/" element={<MainMap />} />
                    <Route path="/guides" element={<div>Guides/Safety Page</div>} />
                    <Route path="/settings" element={<div>Settings Page</div>} />
                    <Route path="/help" element={<div>Help Page</div>} />
                </Routes>
                {activeItem === 'explore' && (
                    <Modal onClose={() => setActiveItem('map')}>
                        <Explore />
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