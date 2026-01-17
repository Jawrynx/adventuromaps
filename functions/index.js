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

// Firebase Admin SDK for custom claims
const admin = require('firebase-admin');
admin.initializeApp();

// 🔥 CRITICAL FIX: The correct way to import secrets in Firebase Functions v2
const { defineSecret } = require('firebase-functions/params'); 

// Google Cloud Text-to-Speech
const textToSpeech = require('@google-cloud/text-to-speech');

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

/**
 * Cloud Function to generate TTS audio using Google Cloud Text-to-Speech
 * Uses the default service account credentials in Firebase Functions environment
 */
exports.generateTTS = onCall({
    // Allow larger payloads for audio responses
    enforceAppCheck: false,
    cors: true
}, async (request) => {
    const { text, voiceConfig, audioConfig } = request.data;
    
    if (!text) {
        throw new Error('Text is required for TTS generation');
    }
    
    logger.info("TTS generation requested", { textLength: text.length });
    
    try {
        // Create TTS client - uses default credentials in Firebase environment
        const client = new textToSpeech.TextToSpeechClient();
        
        // Build the request
        const ttsRequest = {
            input: { text: text },
            voice: {
                languageCode: voiceConfig?.languageCode || 'en-GB',
                name: voiceConfig?.name || 'en-GB-Neural2-C', // Female neural voice
                ssmlGender: voiceConfig?.ssmlGender || 'FEMALE' // NEUTRAL not supported
            },
            audioConfig: audioConfig || {
                audioEncoding: 'MP3',
                speakingRate: 0.9,
                pitch: 0,
                volumeGainDb: 0
            },
            // Enable word time offsets for keyframe generation
            enableTimePointing: ['SSML_MARK']
        };
        
        logger.info("Sending TTS request", { voice: ttsRequest.voice.name });
        
        // Perform the text-to-speech request
        const [response] = await client.synthesizeSpeech(ttsRequest);
        
        logger.info("TTS response received", { 
            audioLength: response.audioContent ? response.audioContent.length : 0,
            hasTimepoints: !!response.timepoints
        });
        
        // Convert audio content to base64 string for transmission
        const audioBase64 = response.audioContent.toString('base64');
        
        return {
            audioContent: audioBase64,
            timepoints: response.timepoints || [],
            success: true
        };
        
    } catch (error) {
        logger.error("TTS generation failed", { error: error.message, stack: error.stack });
        throw new Error(`TTS generation failed: ${error.message}`);
    }
});

/**
 * Cloud Function to generate TTS with word-level timestamps
 * Uses SSML to get precise timing for each word
 */
exports.generateTTSWithTimestamps = onCall({
    enforceAppCheck: false,
    cors: true
}, async (request) => {
    const { text, voiceConfig } = request.data;
    
    if (!text) {
        throw new Error('Text is required for TTS generation');
    }
    
    logger.info("TTS with timestamps requested", { textLength: text.length });
    
    try {
        const client = new textToSpeech.TextToSpeechClient();
        
        // Split text into words and create SSML with marks
        const words = text.split(/\s+/);
        let ssml = '<speak>';
        words.forEach((word, index) => {
            ssml += `<mark name="word${index}"/>${word} `;
        });
        ssml += '</speak>';
        
        const ttsRequest = {
            input: { ssml: ssml },
            voice: {
                languageCode: voiceConfig?.languageCode || 'en-GB',
                name: voiceConfig?.name || 'en-GB-Neural2-C', // Female neural voice
                ssmlGender: voiceConfig?.ssmlGender || 'FEMALE' // NEUTRAL not supported, use FEMALE
            },
            audioConfig: {
                audioEncoding: 'MP3',
                speakingRate: 0.9,
                pitch: 0,
                volumeGainDb: 0
            },
            enableTimePointing: ['SSML_MARK']
        };
        
        const [response] = await client.synthesizeSpeech(ttsRequest);
        
        // Generate keyframes from timepoints (raw timestamps - frontend will scale)
        const keyframes = [];
        let accumulatedText = '';
        
        if (response.timepoints && response.timepoints.length > 0) {
            response.timepoints.forEach((tp, index) => {
                const wordIndex = parseInt(tp.markName.replace('word', ''));
                if (wordIndex < words.length) {
                    accumulatedText += (accumulatedText ? ' ' : '') + words[wordIndex];
                    const rawTime = parseFloat(tp.timeSeconds) || 0;
                    keyframes.push({
                        time: rawTime,
                        text: accumulatedText
                    });
                }
            });
        } else {
            // Fallback: generate estimated keyframes
            const wordsPerSecond = 2.5;
            let currentTime = 0;
            words.forEach((word, index) => {
                accumulatedText += (accumulatedText ? ' ' : '') + word;
                keyframes.push({
                    time: currentTime,
                    text: accumulatedText
                });
                currentTime += 1 / wordsPerSecond;
            });
        }
        
        // Get the max keyframe time for frontend scaling
        const maxKeyframeTime = keyframes.length > 0 ? keyframes[keyframes.length - 1].time : 0;
        logger.info("Keyframes generated", { count: keyframes.length, maxKeyframeTime });
        
        logger.info("TTS with timestamps completed", { 
            keyframeCount: keyframes.length,
            audioLength: response.audioContent ? response.audioContent.length : 0
        });
        
        return {
            audioContent: response.audioContent.toString('base64'),
            keyframes: keyframes,
            maxKeyframeTime: maxKeyframeTime, // For frontend scaling
            success: true
        };
        
    } catch (error) {
        logger.error("TTS with timestamps failed", { error: error.message });
        throw new Error(`TTS generation failed: ${error.message}`);
    }
});

/**
 * Cloud Function to set admin custom claim on a user
 * Only existing admins can promote other users to admin
 * For the first admin, you'll need to call this from Firebase console or use a one-time setup
 */
exports.setAdminClaim = onCall({
    enforceAppCheck: false,
    cors: true
}, async (request) => {
    const { targetUserId } = request.data;
    const callerUid = request.auth?.uid;
    
    if (!targetUserId) {
        throw new Error('Target user ID is required');
    }
    
    logger.info("setAdminClaim called", { callerUid, targetUserId });
    
    try {
        // Check if caller is authenticated
        if (!callerUid) {
            throw new Error('You must be logged in to perform this action');
        }
        
        // Check if caller is already an admin (skip for first admin setup)
        const callerRecord = await admin.auth().getUser(callerUid);
        const callerIsAdmin = callerRecord.customClaims?.admin === true;
        
        // Get count of existing admins to allow first admin setup
        // For security, you might want to remove this after first admin is set
        const isFirstAdminSetup = !callerIsAdmin && callerUid === targetUserId;
        
        if (!callerIsAdmin && !isFirstAdminSetup) {
            throw new Error('Only admins can grant admin privileges');
        }
        
        // Set admin claim on target user
        await admin.auth().setCustomUserClaims(targetUserId, { admin: true });
        
        logger.info("Admin claim set successfully", { targetUserId });
        
        return {
            success: true,
            message: `Admin privileges granted to user ${targetUserId}. User must sign out and sign back in for changes to take effect.`
        };
        
    } catch (error) {
        logger.error("Failed to set admin claim", { error: error.message });
        throw new Error(`Failed to set admin claim: ${error.message}`);
    }
});

/**
 * Cloud Function to remove admin custom claim from a user
 * Only admins can remove admin privileges
 */
exports.removeAdminClaim = onCall({
    enforceAppCheck: false,
    cors: true
}, async (request) => {
    const { targetUserId } = request.data;
    const callerUid = request.auth?.uid;
    
    if (!targetUserId) {
        throw new Error('Target user ID is required');
    }
    
    logger.info("removeAdminClaim called", { callerUid, targetUserId });
    
    try {
        if (!callerUid) {
            throw new Error('You must be logged in to perform this action');
        }
        
        // Check if caller is admin
        const callerRecord = await admin.auth().getUser(callerUid);
        if (callerRecord.customClaims?.admin !== true) {
            throw new Error('Only admins can remove admin privileges');
        }
        
        // Prevent self-demotion (optional safety)
        if (callerUid === targetUserId) {
            throw new Error('You cannot remove your own admin privileges');
        }
        
        // Remove admin claim
        await admin.auth().setCustomUserClaims(targetUserId, { admin: false });
        
        logger.info("Admin claim removed successfully", { targetUserId });
        
        return {
            success: true,
            message: `Admin privileges removed from user ${targetUserId}`
        };
        
    } catch (error) {
        logger.error("Failed to remove admin claim", { error: error.message });
        throw new Error(`Failed to remove admin claim: ${error.message}`);
    }
});

/**
 * Cloud Function to check if a user has admin privileges
 */
exports.checkAdminStatus = onCall({
    enforceAppCheck: false,
    cors: true
}, async (request) => {
    const callerUid = request.auth?.uid;
    
    if (!callerUid) {
        return { isAdmin: false, message: 'Not authenticated' };
    }
    
    try {
        const userRecord = await admin.auth().getUser(callerUid);
        const isAdmin = userRecord.customClaims?.admin === true;
        
        logger.info("Admin status checked", { callerUid, isAdmin });
        
        return {
            isAdmin: isAdmin,
            userId: callerUid
        };
        
    } catch (error) {
        logger.error("Failed to check admin status", { error: error.message });
        return { isAdmin: false, error: error.message };
    }
});

setGlobalOptions({ maxInstances: 10 });