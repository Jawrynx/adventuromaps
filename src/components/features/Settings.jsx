/**
 * Settings.jsx - Application settings and preferences interface
 * 
 * This component provides a comprehensive settings interface with organized tabs
 * for different configuration categories. Users can customize their experience
 * through various preference options including general settings, UI customization,
 * accessibility options, and application information.
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCog, 
    faPalette, 
    faMap, 
    faVolumeUp, 
    faUniversalAccess, 
    faInfoCircle 
} from '@fortawesome/free-solid-svg-icons';
import { settingsService, getSetting, setSetting } from '../../services/settingsService';
import { useSettings } from '../../services/SettingsContext.jsx';
import './css/Settings.css';

/**
 * Settings Component
 * 
 * Tabbed settings interface providing organized access to:
 * - General: Basic application preferences and defaults
 * - UI & Theme: Visual customization and appearance settings
 * - Map: Map display preferences and interaction settings
 * - Audio: Sound and narration preferences
 * - Accessibility: Features for enhanced usability
 * - About: Application information, version, and credits
 * 
 * @returns {JSX.Element} Comprehensive settings interface with tabbed navigation
 */
function Settings() {
    const [activeTab, setActiveTab] = useState('general');
    const [settings, setSettings] = useState(settingsService.getAll());
    const [pendingSettings, setPendingSettings] = useState({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const { refreshSettings } = useSettings();

    // Load settings on component mount
    useEffect(() => {
        const currentSettings = settingsService.getAll();
        setSettings(currentSettings);
        setPendingSettings({}); // Clear any pending changes
        setHasUnsavedChanges(false);
    }, []);

    // Handle setting changes (buffer changes, don't save immediately)
    const handleSettingChange = (key, value) => {
        setPendingSettings(prev => ({ ...prev, [key]: value }));
        setHasUnsavedChanges(true);
    };

    // Get current value for a setting (pending value if exists, otherwise saved value)
    const getCurrentSettingValue = (key) => {
        return pendingSettings.hasOwnProperty(key) ? pendingSettings[key] : settings[key];
    };

    // Handle saving changes
    const handleSaveChanges = () => {
        // Apply all pending changes to the settings service
        Object.entries(pendingSettings).forEach(([key, value]) => {
            setSetting(key, value);
        });
        
        // Update local state to reflect saved changes
        const updatedSettings = { ...settings, ...pendingSettings };
        setSettings(updatedSettings);
        
        // Clear pending changes
        setPendingSettings({});
        setHasUnsavedChanges(false);
        
        // Notify other components that settings have changed
        refreshSettings();
        
        // Show confirmation (optional)
        alert('Settings saved successfully!');
    };

    // Handle settings reset
    const handleResetSettings = () => {
        if (hasUnsavedChanges) {
            const confirmReset = window.confirm('You have unsaved changes. Are you sure you want to reset to defaults?');
            if (!confirmReset) return;
        }
        
        settingsService.resetToDefaults();
        const defaultSettings = settingsService.getAll();
        setSettings(defaultSettings);
        setPendingSettings({});
        setHasUnsavedChanges(false);
    };

    // Handle discarding changes
    const handleDiscardChanges = () => {
        const confirmDiscard = window.confirm('Are you sure you want to discard your changes?');
        if (confirmDiscard) {
            setPendingSettings({});
            setHasUnsavedChanges(false);
        }
    };

    // Settings tab configuration
    const tabs = [
        { id: 'general', label: 'General', icon: faCog },
        { id: 'map', label: 'Map', icon: faMap },
        { id: 'audio', label: 'Audio', icon: faVolumeUp },
        { id: 'accessibility', label: 'Accessibility', icon: faUniversalAccess },
        { id: 'about', label: 'About', icon: faInfoCircle }
    ];

    /**
     * Renders the content for the currently active settings tab
     */
    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="settings-content">
                        <h3>General Settings</h3>
                        <div className="setting-group">
                            <label className="setting-item">
                                <span>Default narration on demo start</span>
                                <input 
                                    type="checkbox" 
                                    checked={getCurrentSettingValue('defaultNarrationEnabled')}
                                    onChange={(e) => handleSettingChange('defaultNarrationEnabled', e.target.checked)}
                                />
                            </label>
                        </div>

                        <div className="setting-group">
                            <h4>Default Demo Settings</h4>
                            <label className="setting-item">
                                <span>Auto-advance waypoints</span>
                                <input 
                                    type="checkbox" 
                                    checked={getCurrentSettingValue('autoAdvanceWaypoints')}
                                    onChange={(e) => handleSettingChange('autoAdvanceWaypoints', e.target.checked)}
                                />
                            </label>
                        </div>
                    </div>
                );

            case 'map':
                return (
                    <div className="settings-content">
                        <h3>Map Settings</h3>
                        <div className="setting-group">
                            <label className="setting-item">
                                <span>Default map type</span>
                                <select 
                                    value={getCurrentSettingValue('defaultMapType')}
                                    onChange={(e) => handleSettingChange('defaultMapType', e.target.value)}
                                >
                                    <option value="terrain">Terrain</option>
                                    <option value="roadmap">Streets</option>
                                    <option value="hybrid">Satellite</option>
                                </select>
                            </label>
                            <label className="setting-item">
                                <span>Map theme</span>
                                <select 
                                    value={getCurrentSettingValue('mapTheme')}
                                    onChange={(e) => handleSettingChange('mapTheme', e.target.value)}
                                >
                                    <option value="adventuro-earth">Adventuro Earth</option>
                                    <option value="gm-light">Google Maps Light</option>
                                    <option value="gm-dark">Google Maps Dark</option>
                                </select>
                            </label>
                            <label className="setting-item">
                                <span>Show scale bar</span>
                                <input type="checkbox" defaultChecked />
                            </label>
                            <label className="setting-item">
                                <span>Show compass</span>
                                <input type="checkbox" defaultChecked />
                            </label>
                        </div>

                        <div className="setting-group">
                            <h4>Navigation</h4>
                            <label className="setting-item">
                                <span>Mouse wheel zoom</span>
                                <input type="checkbox" defaultChecked />
                            </label>
                            <label className="setting-item">
                                <span>Touch gestures</span>
                                <input type="checkbox" defaultChecked />
                            </label>
                            <label className="setting-item">
                                <span>Keyboard shortcuts</span>
                                <input type="checkbox" defaultChecked />
                            </label>
                        </div>
                    </div>
                );

            case 'audio':
                return (
                    <div className="settings-content">
                        <h3>Audio Settings</h3>
                        <div className="setting-group">
                            <label className="setting-item">
                                <span>Master volume</span>
                                <input type="range" min="0" max="100" defaultValue="80" />
                            </label>
                            <label className="setting-item">
                                <span>Narration volume</span>
                                <input type="range" min="0" max="100" defaultValue="90" />
                            </label>
                            <label className="setting-item">
                                <span>Sound effects</span>
                                <input type="checkbox" defaultChecked />
                            </label>
                        </div>

                        <div className="setting-group">
                            <h4>Narration Preferences</h4>
                            <label className="setting-item">
                                <span>Auto-play narration</span>
                                <input type="checkbox" defaultChecked />
                            </label>
                            <label className="setting-item">
                                <span>Text highlighting sync</span>
                                <input type="checkbox" defaultChecked />
                            </label>
                            <label className="setting-item">
                                <span>Playback speed</span>
                                <select defaultValue="1.0">
                                    <option value="0.75">0.75x</option>
                                    <option value="1.0">1.0x</option>
                                    <option value="1.25">1.25x</option>
                                    <option value="1.5">1.5x</option>
                                </select>
                            </label>
                        </div>
                    </div>
                );

            case 'accessibility':
                return (
                    <div className="settings-content">
                        <h3>Accessibility Settings</h3>
                        <div className="setting-group">
                            <label className="setting-item">
                                <span>High contrast mode</span>
                                <input type="checkbox" />
                            </label>
                            <label className="setting-item">
                                <span>Large cursor</span>
                                <input type="checkbox" />
                            </label>
                            <label className="setting-item">
                                <span>Focus indicators</span>
                                <input type="checkbox" defaultChecked />
                            </label>
                        </div>

                        <div className="setting-group">
                            <h4>Screen Reader Support</h4>
                            <label className="setting-item">
                                <span>Enhanced descriptions</span>
                                <input type="checkbox" />
                            </label>
                            <label className="setting-item">
                                <span>Landmark navigation</span>
                                <input type="checkbox" defaultChecked />
                            </label>
                        </div>

                        <div className="setting-group">
                            <h4>Motor Accessibility</h4>
                            <label className="setting-item">
                                <span>Sticky keys support</span>
                                <input type="checkbox" />
                            </label>
                            <label className="setting-item">
                                <span>Extended timeouts</span>
                                <input type="checkbox" />
                            </label>
                        </div>
                    </div>
                );

            case 'about':
                return (
                    <div className="settings-content">
                        <h3>About AdventuroMaps</h3>
                        <div className="about-section">
                            <div className="app-info">
                                <h4>Application Information</h4>
                                <div className="info-item">
                                    <span>Version:</span>
                                    <span>1.0.0-beta</span>
                                </div>
                                <div className="info-item">
                                    <span>Build Date:</span>
                                    <span>October 2025</span>
                                </div>
                                <div className="info-item">
                                    <span>Platform:</span>
                                    <span>Electron + React</span>
                                </div>
                            </div>

                            <div className="credits-section">
                                <h4>Credits & Attribution</h4>
                                <p>AdventuroMaps - Interactive adventure route exploration</p>
                                <p>Built with modern web technologies for immersive outdoor experiences.</p>
                                
                                <div className="tech-stack">
                                    <h5>Technology Stack:</h5>
                                    <ul>
                                        <li>React.js - User Interface</li>
                                        <li>Electron - Desktop Application</li>
                                        <li>Mapbox GL - Interactive Mapping</li>
                                        <li>Firebase - Data & Authentication</li>
                                        <li>Font Awesome - Icon Library</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="links-section">
                                <h4>Resources</h4>
                                <button className="link-button">View Documentation</button>
                                <button className="link-button">Report an Issue</button>
                                <button className="link-button">Privacy Policy</button>
                                <button className="link-button">Terms of Service</button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return <div>Select a settings category</div>;
        }
    };

    return (
        <div id="settings">
            <div className="settings-header">
                <h1>Settings</h1>
                <p>Customize your AdventuroMaps experience</p>
            </div>

            <div className="settings-container">
                {/* Horizontal Tab Navigation */}
                <div className="settings-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <FontAwesomeIcon icon={tab.icon} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content Area */}
                <div className="settings-panel">
                    {renderTabContent()}
                </div>

                {/* Action Buttons */}
                <div className="settings-actions">
                    {hasUnsavedChanges && (
                        <div className="unsaved-changes-indicator">
                            <span style={{ color: '#f39c12', marginRight: '15px' }}>
                                ⚠️ You have unsaved changes
                            </span>
                        </div>
                    )}
                    <button className="btn-secondary" onClick={handleResetSettings}>Reset to Defaults</button>
                    {hasUnsavedChanges && (
                        <button className="btn-secondary" onClick={handleDiscardChanges}>Discard Changes</button>
                    )}
                    <button 
                        className={`btn-primary ${hasUnsavedChanges ? 'btn-primary-active' : 'btn-primary-disabled'}`}
                        onClick={handleSaveChanges}
                        disabled={!hasUnsavedChanges}
                    >
                        Save Changes {hasUnsavedChanges && '●'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Settings;