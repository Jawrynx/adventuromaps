import { defineConfig } from 'vite';
import { pluginExposeRenderer } from './vite.base.config.mjs';
import react from '@vitejs/plugin-react';
import { loadEnv } from 'vite';

// https://vitejs.dev/config
export default defineConfig((env) => {
  // Load env vars from .env.local and .env files
  const envVars = loadEnv(env.mode, process.cwd(), '');
  
  return {
    base: './',
    build: {
      rollupOptions: {
        external: [],
      },
    },
    plugins: [
      pluginExposeRenderer('main_window'),
      react(),
    ],
    resolve: {
      preserveSymlinks: true,
    },
    clearScreen: false,
    define: {
      // Explicitly define environment variables for production
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(envVars.VITE_FIREBASE_API_KEY),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(envVars.VITE_FIREBASE_AUTH_DOMAIN),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(envVars.VITE_FIREBASE_PROJECT_ID),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(envVars.VITE_FIREBASE_STORAGE_BUCKET),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(envVars.VITE_FIREBASE_MESSAGING_SENDER_ID),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(envVars.VITE_FIREBASE_APP_ID),
      'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(envVars.VITE_FIREBASE_MEASUREMENT_ID),
    },
  };
});
