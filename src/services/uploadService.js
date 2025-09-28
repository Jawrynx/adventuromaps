import { storage, ref, uploadBytes, getDownloadURL } from './firebase';

/**
 * Upload Service
 * 
 * Provides file upload functionality to Firebase Storage with URL generation.
 * Handles file validation, upload process, and error management for the
 * AdventuroMaps application's media storage needs.
 */

/**
 * Uploads a file to Firebase Storage and returns its download URL
 * 
 * Handles the complete file upload process including validation, storage
 * reference creation, file upload to Firebase Storage, and download URL
 * generation for immediate use in the application.
 * 
 * @param {File} file - The file object to upload (images, audio, etc.)
 * @param {string} path - Storage path where file should be saved (e.g., 'guides/image.jpg')
 * @returns {Promise<string|null>} Download URL for the uploaded file, or null if no file provided
 * @throws {Error} Throws error if upload process fails
 * 
 * @example
 * // Upload a guide image
 * const imageFile = event.target.files[0];
 * const imagePath = `guides/${Date.now()}_${imageFile.name}`;
 * const imageUrl = await uploadFile(imageFile, imagePath);
 * 
 * @example  
 * // Upload an audio file for waypoints
 * const audioFile = recordedAudio;
 * const audioPath = `audio/${adventureId}/${waypointId}.wav`;
 * const audioUrl = await uploadFile(audioFile, audioPath);
 */
const uploadFile = async (file, path) => {
    // Validate file input
    if (!file) {
        return null; // No file provided
    }

    // Create storage reference with specified path
    const fileRef = ref(storage, path);
    
    try {
        // Upload the file to Firebase Storage
        const snapshot = await uploadBytes(fileRef, file);
        console.log('Uploaded a blob or file!');

        // Generate and return download URL for immediate use
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('File available at', downloadURL);

        return downloadURL;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error; // Re-throw for caller to handle
    }
};

export { uploadFile };