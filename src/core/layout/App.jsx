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
import AdvancedLoadingScreen from '../../components/ui/AdvancedLoadingScreen';
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
    
    // Fetch API key securely from Firebase Function (with offline handling)
    const [apiError, setApiError] = useState(null);

    const fetchApiKey = async () => {
        setApiError(null);
        try {
            const result = await getMapDataSecurely();
            setApiKey(result.data.apiKey);
        } catch (error) {
            console.error('Failed to fetch API key:', error);
            setApiError(error?.message || 'Network error');
        }
    };

    useEffect(() => {
        fetchApiKey();
    }, []);

    // Keep titlebar overlay in sync with loading / error states (Electron only)
    useEffect(() => {
        if (typeof window !== 'undefined' && window.electron && typeof window.electron.setTitleBarOverlay === 'function') {
            try {
                if ((!apiKey && !apiError) || apiError) {
                    // Loading or error: set titlebar background to app background
                    // Keep control symbols white so buttons remain visible
                    window.electron.setTitleBarOverlay({ color: 'rgba(20, 20, 35, 1)', symbolColor: '#ffffff', height: 32 });
                } else if (apiKey) {
                    // Normal app state: restore themed colors
                    window.electron.setTitleBarOverlay({ color: 'rgba(20, 20, 35, 1)', symbolColor: '#ffffff', height: 32 });
                }
            } catch (e) {
                // ignore failures (API not supported on platform)
                // console.warn('setTitleBarOverlay failed', e);
            }
        }
    }, [apiKey, apiError]);

    // While fetching API key (no key, no error) show loading spinner
    if (!apiKey && !apiError) {
        return (
            <>
                {/* Fixed draggable titlebar spacer so window can be moved while loading */}
                {typeof window !== 'undefined' && window.electron && (
                    <div style={{position: 'fixed', top: 0, left: 0, right: 0, height: 32, backgroundColor: 'rgba(20, 20, 35, 1)', WebkitAppRegion: 'drag', zIndex: 9999}}>
                        {/* Reserve right-side as no-drag so native controls remain clickable */}
                        <div style={{position: 'absolute', top: 0, right: 0, bottom: 0, width: 140, WebkitAppRegion: 'no-drag'}} />
                    </div>
                )}

                <AdvancedLoadingScreen 
                    text="Loading map data…" 
                    fullScreen={true}
                    style={{ paddingTop: typeof window !== 'undefined' && window.electron ? 32 : 0 }}
                />
            </>
        );
    }

    // If we failed to load the API key, show a helpful offline message
    if (apiError) {
        return (
            <>
                {/* Fixed draggable titlebar spacer so window can be moved while showing error */}
                {typeof window !== 'undefined' && window.electron && (
                    <div style={{position: 'fixed', top: 0, left: 0, right: 0, height: 32, backgroundColor: '#1E1E28', WebkitAppRegion: 'drag', zIndex: 9999}}>
                        <div style={{position: 'absolute', top: 0, right: 0, bottom: 0, width: 140, WebkitAppRegion: 'no-drag'}} />
                    </div>
                )}

                <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #0f1419 0%, #16213e 100%)', paddingTop: 32}}>
                    <div style={{textAlign: 'center', color: '#bfefff', maxWidth: 520}}>
                        <h2 style={{margin: 0, fontSize: 22}}>Offline or Unable to Load Map Data</h2>
                        <p style={{opacity: 0.85, marginTop: 8}}>We couldn't fetch the Google Maps API key. Please check your internet connection and try again.</p>
                        <div style={{marginTop: 18, display: 'flex', gap: 12, justifyContent: 'center'}}>
                            <button onClick={fetchApiKey} style={{background: '#64c8ff', color: '#071224', border: 'none', padding: '10px 18px', borderRadius: 8, cursor: 'pointer'}}>Retry</button>
                            <button onClick={() => window.location.reload()} style={{background: 'transparent', color: '#bfefff', border: '1px solid rgba(255,255,255,0.06)', padding: '10px 18px', borderRadius: 8, cursor: 'pointer'}}>Reload App</button>
                        </div>
                    </div>
                </div>
            </>
        );
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