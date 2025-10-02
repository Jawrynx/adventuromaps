/**
 * App.jsx - Root application component
 * 
 * This is the main entry point for the AdventuroMaps application.
 * It sets up the core providers and routing infrastructure needed
 * for the entire application to function.
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { SettingsProvider } from '../../services/SettingsContext.jsx';
import { getMapDataSecurely } from '../../services/firebase.js';
import MainContent from './MainContent';
import '../../styles/index.css';
import '../../components/ui/css/Buttons.css';

/**
 * App Component
 * 
 * The root component that wraps the entire application with necessary providers:
 * - Settings Provider: Provides global settings state management across the app
 * - Google Maps API Provider: Enables all map functionality throughout the app
 * - Router: Uses HashRouter for Electron builds or BrowserRouter for web builds
 * 
 * @returns {JSX.Element} The complete application wrapped in providers
 */
const App = () => {
    // State for the API key fetched from Firebase Function
    const [apiKey, setApiKey] = useState(null);
    
    // Detect if running in Electron environment
    const isElectron = typeof window !== 'undefined' && window.electron;
    
    // Choose appropriate router based on environment
    const RouterComponent = isElectron ? HashRouter : BrowserRouter;
    
    // Fetch API key securely from Firebase Function
    useEffect(() => {
        const fetchApiKey = async () => {
            try {
                const result = await getMapDataSecurely();
                setApiKey(result.data.apiKey);
            } catch (error) {
                console.error('Failed to fetch API key:', error);
            }
        };
        
        fetchApiKey();
    }, []);
    
    // Don't render until we have the API key
    if (!apiKey) {
        return <div>Loading...</div>;
    }
    
    return (
        // Settings Provider - provides global settings state management
        <SettingsProvider>
            {/* Google Maps API Provider - enables map functionality across the entire app */}
            <APIProvider 
                apiKey={apiKey}                                     // API key from secure Firebase Function
                mapId="8a2ac04064bf3833742b72c4"                  // Custom Google Map ID for styling
                libraries={['geometry', 'places', 'marker']}       // Required Google Maps libraries
                version='beta'                                      // Use beta version for latest features
            >
                {/* Router - uses HashRouter for Electron or BrowserRouter for web */}
                <RouterComponent>
                    <MainContent />
                </RouterComponent>
            </APIProvider>
        </SettingsProvider>
    );
};

export default App;