/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { setGlobalOptions } = require("firebase-functions");
// const { onRequest } = require("firebase-functions/https"); // Not needed for the secure function
const logger = require("firebase-functions/logger");

const { onCall } = require("firebase-functions/v2/https");

// 🔥 CRITICAL FIX: The correct way to import secrets in Firebase Functions v2
const { defineSecret } = require('firebase-functions/params'); 

// 1. Define the secret parameter using the name from Secret Manager
const GOOGLE_MAPS_API_KEY = defineSecret('VITE_GOOGLE_MAPS_API_KEY');

/**
 * Cloud Function to securely fetch data using the Google Maps API Key.
 * The client calls this function, and the function uses the private key on the server.
 */
exports.getMapDataSecurely = onCall({
    // 2. Bind the secret to the function, making it accessible at runtime
    secrets: [GOOGLE_MAPS_API_KEY] 
}, async (request) => {
    // 3. Access the secret value safely at runtime
    const apiKey = GOOGLE_MAPS_API_KEY.value(); 
    
    logger.info("Function called. API Key accessed securely.", { structuredData: true });
    return { apiKey: apiKey }; 
});

setGlobalOptions({ maxInstances: 10 });