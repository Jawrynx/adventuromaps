import React from 'react';
import Sidebar from './components/Sidebar';
import MainMap from './components/MainMap';

import { APIProvider } from '@vis.gl/react-google-maps';

const App = () => {
    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <div style={{ display: 'flex', height: '100vh' }}>
                <Sidebar />
                <div style={{ flexGrow: 1 }}>
                    <MainMap />
                </div>
            </div>
        </APIProvider>
    )
}

export default App;