import express from 'express';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory's .env file
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log('✅ Loaded .env from parent directory');
} else {
    console.warn('⚠️  No .env file found in parent directory');
}

const app = express();
const PORT = 3333;

// Serve static files
app.use(express.static(__dirname));

// API endpoint to get Firebase config (from environment variables)
app.get('/api/firebase-config', (req, res) => {
    const config = {
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.VITE_FIREBASE_APP_ID,
        measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
    };

    // Check if config is valid
    if (!config.apiKey || !config.projectId) {
        return res.status(500).json({
            error: 'Firebase config not found in environment variables',
            hint: 'Make sure .env file exists in the adventuromaps root directory with VITE_FIREBASE_* variables'
        });
    }

    res.json(config);
});

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║         TTS & Timestamp Debugger Server                     ║
╠════════════════════════════════════════════════════════════╣
║  🌐 Open: http://localhost:${PORT}                            ║
║  📁 Serving from: ${__dirname}
╚════════════════════════════════════════════════════════════╝
    `);
});
