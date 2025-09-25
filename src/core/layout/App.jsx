import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import MainContent from './MainContent';
import '../../styles/index.css';
import '../../components/ui/css/Buttons.css';

const App = () => {
    return (
        <APIProvider 
            apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
            mapId="8a2ac04064bf3833742b72c4"
            libraries={['geometry', 'places', 'marker']}
            version='beta'
        >
            <BrowserRouter>
                <MainContent />
            </BrowserRouter>
        </APIProvider>
    );
};

export default App;