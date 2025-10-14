/**
 * AdventuroMaps Electron Main Process
 * 
 * Main Electron process that creates and manages the desktop application window.
 * Handles window lifecycle, IPC communication for window focus management,
 * and application startup/shutdown processes.
 * 
 * Features:
 * - Browser window creation with secure web preferences
 * - IPC communication for window refocus simulation
 * - Development server integration with Vite
 * - Cross-platform window management
 * - Squirrel startup handling for Windows installers
 * 
 * @fileoverview Main Electron process for AdventuroMaps desktop application
 */

import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

// Handle Squirrel events on Windows (installer/updater)
if (started) {
  app.quit();
}

/**
 * Create the main application window
 * 
 * Initializes the primary BrowserWindow with secure web preferences and
 * sets up IPC communication for window focus management. Loads the React
 * application either from development server or built files.
 */
const createWindow = () => {
  // Create the browser window with secure configuration
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: MAIN_WINDOW_VITE_DEV_SERVER_URL 
      ? path.join(__dirname, '../../public/assets/adventuro-logo-min.png') // Development path
      : path.join(__dirname, '../renderer/assets/adventuro-logo-min.png'), // Production path
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Security: Disable node integration in renderer
      contextIsolation: true, // Security: Isolate context between main and renderer
      webSecurity: true, // Enable web security
    },
  });

  /**
   * Simulate window refocus for proper input handling
   * 
   * Briefly blurs then refocuses the window to ensure proper input
   * field focusing in certain scenarios, particularly for modal dialogs.
   */
  const simulateWindowRefocus = () => {
    mainWindow.blur();
    setTimeout(() => mainWindow.focus(), 50);
  };

  // Set up IPC communication for window focus management
  const { ipcMain } = require('electron');
  ipcMain.on('simulate-window-refocus', () => {
    simulateWindowRefocus();
  });

  // Load the React application
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // Development: Load from Vite dev server
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Load from built files
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};

/**
 * Application lifecycle management
 */

// Initialize app when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // macOS: Re-create window when dock icon is clicked and no windows are open
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit application when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
