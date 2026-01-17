import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { uploadFile } from '../../services/uploadService';
import { getUserDocument } from '../../services/userService';
import Notification from './Notification';
import useAlert from '../../hooks/useAlert';
import './css/GuideForm.css';

/**
 * GuideForm Component
 * 
 * Form component for creating and editing guide/post content in the application.
 * Supports image upload with preview, multiple content categories, and both
 * creation and editing modes. Integrates with Firebase Firestore for data
 * persistence and Firebase Storage for image uploads.
 * 
 * Features:
 * - Create new guides and posts
 * - Edit existing content
 * - Image upload with preview functionality
 * - Categorized content organization
 * - Form validation and error handling
 * - Real-time image preview
 * - Firebase integration for data/file storage
 * 
 * @param {Object} props - Component props
 * @param {Object} props.existingGuide - Existing guide data for edit mode
 * @param {Function} props.onClose - Callback when form is closed
 * @param {Function} props.onSuccess - Callback when form submission succeeds
 * @returns {JSX.Element} Guide creation/editing form
 */
function GuideForm({ existingGuide, onClose, onSuccess }) {
    const { showAlert, AlertComponent } = useAlert();
    
    const [formData, setFormData] = useState({
        type: existingGuide?.type || 'Guide',
        category: existingGuide?.category || 'Getting Started',
        title: existingGuide?.title || '',
        author: existingGuide?.author || '',
        content: existingGuide?.content || '',
        image_url: existingGuide?.image_url || ''
    });
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(existingGuide?.image_url || null);
    const [isUploading, setIsUploading] = useState(false);
    const [notification, setNotification] = useState({
        isVisible: false,
        message: '',
        type: 'success'
    });

    // Automatically set author from current user's Firestore document
    useEffect(() => {
        const fetchUserAndSetAuthor = async () => {
            const currentUser = auth.currentUser;
            if (currentUser && !existingGuide) {
                try {
                    // Get the most up-to-date user document from Firestore
                    const userDocument = await getUserDocument(currentUser.uid);
                    
                    // Use displayName from Firestore, fallback to Auth displayName, then email
                    const authorName = userDocument?.displayName || 
                                     currentUser.displayName || 
                                     currentUser.email || 
                                     'Anonymous User';
                    
                    setFormData(prev => ({
                        ...prev,
                        author: authorName
                    }));
                } catch (error) {
                    console.error('Error fetching user document:', error);
                    // Fallback to Firebase Auth user data if Firestore fetch fails
                    setFormData(prev => ({
                        ...prev,
                        author: currentUser.displayName || currentUser.email || 'Anonymous User'
                    }));
                }
            }
        };

        fetchUserAndSetAuthor();
    }, [existingGuide]);

    const categories = [
        'Getting Started',
        'Using the Map & Routes',
        'Offline Maps & Sharing',
        'Personalizing Your Experience',
        'Trip Planning & Preparation',
        'Emergency & First Aid',
        'Navigation & Wayfinding',
        'Environmental Safety & Etiquette',
        'Activity-Specific Guides'
    ];

    /**
     * Handle form field changes
     * 
     * Updates form state when user types in input fields.
     * Uses dynamic property names to update the correct field.
     * 
     * @param {Event} e - Input change event
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /**
     * Handle image file selection
     * 
     * Processes selected image file and creates preview URL for immediate
     * visual feedback. Stores file for upload during form submission.
     * 
     * @param {Event} e - File input change event
     */
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Create object URL for immediate preview
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    /**
     * Remove selected image
     * 
     * Clears image selection and preview, resets form image data,
     * and clears the file input field.
     */
    const removeImage = () => {
        setSelectedFile(null);
        setImagePreview(null);
        setFormData(prev => ({
            ...prev,
            image_url: ''
        }));
        // Clear file input element
        const fileInput = document.getElementById('image');
        if (fileInput) fileInput.value = '';
    };

    /**
     * Handle form submission
     * 
     * Processes form data, uploads image if selected, and saves guide to Firestore.
     * Supports both creating new guides and updating existing ones. Handles
     * error states and loading indicators during async operations.
     * 
     * @param {Event} e - Form submit event
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        
        try {
            let imageUrl = formData.image_url;
            
            // Upload new image if selected
            if (selectedFile) {
                const fileName = `guides/${Date.now()}_${selectedFile.name}`;
                imageUrl = await uploadFile(selectedFile, fileName);
            }
            
            const dataToSave = {
                ...formData,
                image_url: imageUrl
            };
            
            if (existingGuide) {
                // Update existing guide
                const guideRef = doc(db, 'posts', existingGuide.id);
                await updateDoc(guideRef, {
                    ...dataToSave,
                    updated_at: serverTimestamp()
                });
                
                // Show success alert
                await showAlert(
                    'Your guide has been updated successfully!',
                    'Guide Updated',
                    'success'
                );
            } else {
                // Create new guide
                await addDoc(collection(db, 'posts'), {
                    ...dataToSave,
                    created_at: serverTimestamp()
                });
                
                // Show success alert
                await showAlert(
                    'Your guide has been published successfully!',
                    'Guide Published',
                    'success'
                );
            }
            
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving guide:', error);
            await showAlert(
                'There was an error saving your guide. Please try again.',
                'Error',
                'error'
            );
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            {AlertComponent}
            <form className="guide-form animate-in" onSubmit={handleSubmit}>
            <h2>{existingGuide ? 'Edit Guide' : 'Create New Guide'}</h2>
            
            <div className="form-group">
                <label htmlFor="type">Type:</label>
                <select 
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                >
                    <option value="Guide">Guide</option>
                    <option value="Safety">Safety</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="category">Category:</label>
                <select 
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                >
                    {categories.map(category => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="title">Title:</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter guide title"
                />
            </div>

            {!existingGuide && formData.author && (
                <div className="form-group author-display">
                    <label>Author:</label>
                    <p className="author-info">{formData.author}</p>
                </div>
            )}

            <div className="form-group">
                <label htmlFor="image">Guide Image:</label>
                <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                />
                
                {imagePreview && (
                    <div className="image-preview">
                        <img src={imagePreview} alt="Preview" className="preview-image" />
                        <button 
                            type="button" 
                            className="remove-image-btn"
                            onClick={removeImage}
                        >
                            Remove Image
                        </button>
                    </div>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="content">Content (Markdown):</label>
                <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    placeholder="Write your guide content in Markdown format"
                    rows={15}
                />
            </div>

            <div className="form-actions">
                <button type="button" className="adm-button red" onClick={onClose}>
                    Cancel
                </button>
                <button type="submit" className="adm-button green" disabled={isUploading}>
                    {isUploading ? 'Uploading...' : (existingGuide ? 'Update Guide' : 'Publish Guide')}
                </button>
            </div>
            </form>
        </>
    );
}

GuideForm.propTypes = {
    existingGuide: PropTypes.shape({
        id: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        category: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        author: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        image_url: PropTypes.string
    }),
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func.isRequired
};

export default GuideForm;