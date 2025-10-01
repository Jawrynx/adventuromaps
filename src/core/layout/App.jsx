/**
 * App.jsx - Root application component
 * 
 * This is the main entry point for the AdventuroMaps application.
 * It sets up the core providers and routing infrastructure needed
 * for the entire application to function.
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { SettingsProvider } from '../../services/SettingsContext.jsx';
import MainContent from './MainContent';
import '../../styles/index.css';
import '../../components/ui/css/Buttons.css';

/**
 * App Component
 * 
 * The root component that wraps the entire application with necessary providers:
 * - Settings Provider: Provides global settings state management across the app
 * - Google Maps API Provider: Enables all map functionality throughout the app
 * - Browser Router: Enables client-side routing for navigation between different views
 * 
 * @returns {JSX.Element} The complete application wrapped in providers
 */
const App = () => {
    return (
        // Settings Provider - provides global settings state management
        <SettingsProvider>
            {/* Google Maps API Provider - enables map functionality across the entire app */}
            <APIProvider 
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}  // API key from environment variables
                mapId="8a2ac04064bf3833742b72c4"                  // Custom Google Map ID for styling
                libraries={['geometry', 'places', 'marker']}       // Required Google Maps libraries
                version='beta'                                      // Use beta version for latest features
            >
                {/* Browser Router - enables client-side routing throughout the app */}
                <BrowserRouter>
                    <MainContent />
                </BrowserRouter>
            </APIProvider>
        </SettingsProvider>
    );
};

export default App;