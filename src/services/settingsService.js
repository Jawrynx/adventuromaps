/**
 * settingsService.js - Application settings management
 * 
 * Provides centralized settings management using localStorage for persistence.
 * Handles default values, validation, and easy access to user preferences
 * across the application.
 */

// Default settings configuration
const DEFAULT_SETTINGS = {
    // General Settings
    defaultNarrationEnabled: true,
    autoSavePreferences: true,
    rememberLastRoute: false,
    
    // Demo Settings  
    transitionDuration: 2000,
    autoAdvanceWaypoints: false,
    
    // UI & Theme Settings
    theme: 'auto',
    fontSize: 'medium',
    compactMode: false,
    reducedMotion: false,
    smoothTransitions: true,
    
    // Map Settings
    defaultMapStyle: 'streets',
    showScaleBar: true,
    showCompass: true,
    mouseWheelZoom: true,
    touchGestures: true,
    keyboardShortcuts: true,
    
    // Audio Settings
    masterVolume: 80,
    narrationVolume: 90,
    soundEffects: true,
    autoPlayNarration: true,
    textHighlightingSync: true,
    playbackSpeed: 1.0,
    
    // Accessibility Settings
    highContrastMode: false,
    largeCursor: false,
    focusIndicators: true,
    enhancedDescriptions: false,
    landmarkNavigation: true,
    stickyKeysSupport: false,
    extendedTimeouts: false
};

/**
 * Settings Service Class
 * 
 * Manages application settings with localStorage persistence.
 * Provides methods for getting, setting, and resetting user preferences.
 */
class SettingsService {
    constructor() {
        this.STORAGE_KEY = 'adventuromaps_settings';
        this.settings = this.loadSettings();
    }

    /**
     * Loads settings from localStorage or returns defaults
     * 
     * @returns {Object} Current settings object
     */
    loadSettings() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with defaults to handle new settings added in updates
                return { ...DEFAULT_SETTINGS, ...parsed };
            }
        } catch (error) {
            console.warn('Error loading settings from localStorage:', error);
        }
        return { ...DEFAULT_SETTINGS };
    }

    /**
     * Saves current settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving settings to localStorage:', error);
        }
    }

    /**
     * Gets a specific setting value
     * 
     * @param {string} key - Setting key to retrieve
     * @returns {*} Setting value or undefined if not found
     */
    get(key) {
        return this.settings[key];
    }

    /**
     * Sets a specific setting value and saves to localStorage
     * 
     * @param {string} key - Setting key to update
     * @param {*} value - New value for the setting
     */
    set(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }

    /**
     * Gets all current settings
     * 
     * @returns {Object} Complete settings object
     */
    getAll() {
        return { ...this.settings };
    }

    /**
     * Updates multiple settings at once
     * 
     * @param {Object} updates - Object with key-value pairs to update
     */
    updateMultiple(updates) {
        this.settings = { ...this.settings, ...updates };
        this.saveSettings();
    }

    /**
     * Resets all settings to defaults
     */
    resetToDefaults() {
        this.settings = { ...DEFAULT_SETTINGS };
        this.saveSettings();
    }

    /**
     * Resets a specific setting to its default value
     * 
     * @param {string} key - Setting key to reset
     */
    resetSetting(key) {
        if (key in DEFAULT_SETTINGS) {
            this.settings[key] = DEFAULT_SETTINGS[key];
            this.saveSettings();
        }
    }

    /**
     * Gets the default value for a specific setting
     * 
     * @param {string} key - Setting key
     * @returns {*} Default value for the setting
     */
    getDefault(key) {
        return DEFAULT_SETTINGS[key];
    }
}

// Export singleton instance
export const settingsService = new SettingsService();

// Export individual methods for convenience
export const getSetting = (key) => settingsService.get(key);
export const setSetting = (key, value) => settingsService.set(key, value);
export const getAllSettings = () => settingsService.getAll();
export const updateSettings = (updates) => settingsService.updateMultiple(updates);
export const resetSettings = () => settingsService.resetToDefaults();