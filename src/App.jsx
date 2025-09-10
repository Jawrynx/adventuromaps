import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import MainContent from './MainContent';

const App = () => {
    return (
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <BrowserRouter>
                <MainContent />
            </BrowserRouter>
        </APIProvider>
    );
};

export default App;