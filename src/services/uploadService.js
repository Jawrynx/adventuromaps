import { storage, ref, uploadBytes, getDownloadURL } from './firebase';

// Uploads a file to Storage and return its corresponding URL
const uploadFile = async (file, path) => {
    if (!file) {
        return null;
    }

    const fileRef = ref(storage, path);
    
    try {
        // Upload the file to Firebase Storage
        const snapshot = await uploadBytes(fileRef, file);
        console.log('Uploaded a blob or file!');

        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('File available at', downloadURL);

        return downloadURL;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
    }
};

export { uploadFile };