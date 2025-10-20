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
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname } from 'node:path';

// Handle Squirrel events on Windows (installer/updater)
if (started) {
  app.quit();
}

/**
 * Create a local HTTP server to serve the app files
 * This is necessary for Google Maps API which requires HTTP/HTTPS URLs
 */
const createLocalServer = () => {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        let filePath = req.url === '/' ? '/index.html' : req.url;
        
        // Remove query parameters
        filePath = filePath.split('?')[0];
        
        // Security: prevent directory traversal
        if (filePath.includes('..')) {
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        
        // Remove leading slash
        if (filePath.startsWith('/')) {
          filePath = filePath.slice(1);
        }
        
        const fullPath = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}`, filePath);
        
        try {
          const data = await readFile(fullPath);
          const ext = extname(fullPath);
          const mimeType = getMimeType(ext);
          
          res.writeHead(200, {
            'Content-Type': mimeType,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          });
          res.end(data);
        } catch (error) {
          res.writeHead(404);
          res.end('Not Found');
        }
      } catch (error) {
        console.error('Server error:', error);
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    });
    
    // Listen on a random available port
    server.listen(0, 'localhost', () => {
      const port = server.address().port;
      resolve({ server, port });
    });
  });
};

/**
 * Get MIME type for file extension
 */
const getMimeType = (ext) => {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
  };
  return mimeTypes[ext] || 'application/octet-stream';
};

/**
 * Create the main application window
 * 
 * Initializes the primary BrowserWindow with secure web preferences and
 * sets up IPC communication for window focus management. Loads the React
 * application either from development server or built files.
 */
const createWindow = async () => {
  let localServerPort = null;
  
  // Create local HTTP server for production builds
  if (!MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    const { server, port } = await createLocalServer();
    localServerPort = port;
    console.log(`Local server started on port ${port}`);
  }

  // Create the browser window with secure configuration
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: MAIN_WINDOW_VITE_DEV_SERVER_URL 
      ? path.join(__dirname, '../../public/assets/adventuro-logo-min.png') // Development path
      : path.join(process.resourcesPath, 'public/assets/adventuro-logo-min.png'), // Production path
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
    // Production: Load from local HTTP server
    mainWindow.loadURL(`http://localhost:${localServerPort}`);
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
