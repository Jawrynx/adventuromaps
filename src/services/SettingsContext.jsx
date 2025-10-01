/**
 * SettingsContext.jsx - React context for settings management
 * 
 * Provides a React context for sharing settings state across components
 * and notifying components when settings change. This allows components
 * to react to settings changes without prop drilling.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsService } from './settingsService';

// Create the settings context
const SettingsContext = createContext();

/**
 * Settings Provider Component
 * 
 * Wraps the application and provides settings state and update functions
 * to all child components through React context.
 * 
 * @param {Object} children - React children to wrap with settings context
 * @returns {JSX.Element} Settings context provider
 */
export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(settingsService.getAll());
    const [settingsVersion, setSettingsVersion] = useState(0);

    /**
     * Refreshes settings from the settings service
     * This is called when settings are saved or reset
     */
    const refreshSettings = () => {
        setSettings(settingsService.getAll());
        setSettingsVersion(prev => prev + 1); // Increment version to trigger re-renders
    };

    /**
     * Gets a specific setting value
     * 
     * @param {string} key - Setting key to retrieve
     * @returns {*} Setting value
     */
    const getSetting = (key) => {
        return settings[key];
    };

    /**
     * Updates a setting and saves it
     * 
     * @param {string} key - Setting key to update
     * @param {*} value - New value for the setting
     */
    const updateSetting = (key, value) => {
        settingsService.set(key, value);
        refreshSettings();
    };

    /**
     * Updates multiple settings at once
     * 
     * @param {Object} updates - Object with key-value pairs to update
     */
    const updateMultipleSettings = (updates) => {
        settingsService.updateMultiple(updates);
        refreshSettings();
    };

    /**
     * Resets all settings to defaults
     */
    const resetSettings = () => {
        settingsService.resetToDefaults();
        refreshSettings();
    };

    // Context value to provide to children
    const contextValue = {
        settings,
        settingsVersion,
        getSetting,
        updateSetting,
        updateMultipleSettings,
        resetSettings,
        refreshSettings
    };

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
}

/**
 * Custom hook to use settings context
 * 
 * Provides easy access to settings and settings functions from any component
 * within the SettingsProvider.
 * 
 * @returns {Object} Settings context value
 */
export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

// Export the context for direct use if needed
export { SettingsContext };