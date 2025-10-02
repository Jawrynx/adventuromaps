/**
 * WaypointEditor.jsx - Advanced waypoint editing interface
 * 
 * Provides comprehensive waypoint editing capabilities including:
 * - Text descriptions and instructions
 * - Multiple image upload and management
 * - Audio narration file upload
 * - Keyframe file upload for animations
 * - Different field sets for explorations vs adventures
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import NarrationPreview from './NarrationPreview';
import './css/NarrationPreview.css';

/**
 * WaypointEditor Component
 * 
 * Advanced editor for waypoint details that allows administrators to add
 * rich content including images, audio, and animation data to waypoints.
 * 
 * @param {Object} waypointData - Object containing routeId, waypointIndex, and waypoint data
 * @param {string} itemType - Type of parent item ('exploration' or 'adventure')
 * @param {Function} onClose - Callback to close the editor
 * @param {Function} onSave - Callback to save waypoint changes
 * @returns {JSX.Element} The waypoint editing interface
 */
function WaypointEditor({ waypointData, itemType, onClose, onSave }) {
    // ========== TEXT CONTENT STATE ==========
    const [description, setDescription] = useState(waypointData.waypoint.description || '');
    const [instructions, setInstructions] = useState(waypointData.waypoint.instructions || '');
    
    // ========== IMAGE MANAGEMENT STATE ==========
    const [images, setImages] = useState([]);                    // New image files to upload
    const [existingImageUrls, setExistingImageUrls] = useState([]); // Previously uploaded image URLs
    const [newImagePreviews, setNewImagePreviews] = useState([]); // Preview URLs for new images
    
    // ========== MEDIA FILE STATE ==========
    const [narration, setNarration] = useState(null);           // Audio narration file
    const [keyframes, setKeyframes] = useState(null);           // Animation keyframes text file
    
    // ========== UI STATE ==========
    const [isSaving, setIsSaving] = useState(false);            // Prevent multiple save operations
    const [showPreview, setShowPreview] = useState(false);      // Show/hide narration preview

    /**
     * Initializes editor state when waypoint data changes
     * 
     * Resets all form fields and loads existing waypoint data
     * when a new waypoint is selected for editing.
     */
    useEffect(() => {
        
        // Load existing text content
        const newDescription = waypointData.waypoint.description || '';
        const newInstructions = waypointData.waypoint.instructions || '';
        
        setDescription(newDescription);
        setInstructions(newInstructions);
        
        // Reset file upload states
        setImages([]);
        setNarration(null);
        setKeyframes(null);
        setNewImagePreviews([]);

        // Load existing image URLs if available
        if (waypointData.waypoint.image_urls && waypointData.waypoint.image_urls.length > 0) {
            setExistingImageUrls(waypointData.waypoint.image_urls);
        } else {
            setExistingImageUrls([]);
        }
    }, [waypointData]);

    /**
     * Handles new image file selection
     * 
     * Processes newly selected image files and creates preview URLs
     * for immediate visual feedback in the interface.
     * 
     * @param {Event} e - File input change event
     */
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = [...images, ...files];
        setImages(newImages);

        // Create preview URLs for immediate display
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setNewImagePreviews(prevPreviews => [...prevPreviews, ...newPreviewUrls]);
    };

    /**
     * Handles image removal from waypoint
     * 
     * Removes either existing saved images or newly added images
     * depending on the image type and updates the appropriate state.
     * 
     * @param {number} indexToRemove - Index of image to remove
     * @param {boolean} isExisting - Whether this is an existing saved image or new image
     */
    const handleRemoveImage = (indexToRemove, isExisting) => {
        if (isExisting) {
            // Remove from existing image URLs (already saved to server)
            setExistingImageUrls(prevUrls => {
                const newUrls = prevUrls.filter((_, index) => index !== indexToRemove);
                return newUrls;
            });
        } else {
            // Remove from new images (not yet uploaded)
            const newImageIndex = indexToRemove - existingImageUrls.length;
            
            // Remove preview URL
            setNewImagePreviews(prevPreviews => {
                const newPreviews = prevPreviews.filter((_, index) => index !== newImageIndex);
                return newPreviews;
            });
            
            // Remove file object
            setImages(prevFiles => {
                const newFiles = prevFiles.filter((_, index) => index !== newImageIndex);
                return newFiles;
            });
        }
    };

    /**
     * Handles saving waypoint data with all associated media files
     * 
     * Compiles all waypoint data including text, images, and media files
     * and calls the parent save handler to process uploads and database updates.
     */
    const handleSave = async () => {
        if (isSaving) return; // Prevent multiple save operations
        
        setIsSaving(true);
        
        try {
            // Compile all waypoint data for saving
            const waypointDataToSave = {
                // Start with existing waypoint data to preserve other fields
                ...waypointData.waypoint,
                // Override with updated values (these will take precedence)
                description,
                instructions,
                images,              // New image files to upload
                existingImageUrls,   // Previously uploaded image URLs to preserve
                narration,           // Audio narration file (if new one selected)
                keyframes,           // Animation keyframes file (if new one selected)
                // Preserve existing narration and keyframes URLs if no new files are uploaded
                narration_url: narration ? undefined : waypointData.waypoint.narration_url,
                keyframes_url: keyframes ? undefined : waypointData.waypoint.keyframes_url
            };

            // Call parent save handler with compiled data
            await onSave(waypointData.routeId, waypointData.waypointIndex, waypointDataToSave);
            onClose(); // Close editor after successful save
        } catch (error) {
            console.error('Failed to save waypoint:', error);
            alert('Failed to save waypoint. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    // Show preview component if in preview mode
    if (showPreview) {
        return (
            <NarrationPreview
                description={description}
                narrationUrl={waypointData.waypoint.narration_url}
                keyframesUrl={waypointData.waypoint.keyframes_url}
                onClose={() => setShowPreview(false)}
            />
        );
    }

    return (
        <div className="waypoint-editor">
            <h3>{waypointData.waypoint.name}</h3>
            <p>Lat: {waypointData.waypoint.lat.toFixed(6)}</p>
            <p>Long: {waypointData.waypoint.lng.toFixed(6)}</p>

            <div className="editor-section" id='description-editor'>
                <label htmlFor="description">Description/Message:</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            {itemType === 'adventure' && (
                <div className="editor-section" id='instructions-editor'>
                    <label htmlFor="instructions">Instructions:</label>
                    <textarea
                        id="instructions"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                    />
                </div>
            )}

            <div className="editor-section">
                <label htmlFor="image-upload">Upload Images (Optional):</label>
                <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                />
                <div className="images-preview">
                    {/* Display existing saved images */}
                    {existingImageUrls.map((url, index) => (
                        <div key={`existing-${index}`} className="image">
                            <button className='remove-image red' onClick={() => handleRemoveImage(index, true)}>
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                            <img src={url} alt={`Existing Image ${index + 1}`} />
                        </div>
                    ))}
                    {/* Display new image previews */}
                    {newImagePreviews.map((url, index) => (
                        <div key={`new-${index}`} className="image">
                            <button className='remove-image red' onClick={() => handleRemoveImage(existingImageUrls.length + index, false)}>
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                            <img src={url} alt={`New Preview ${index + 1}`} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="editor-section">
                <label htmlFor="narration-upload">Upload Narration (Optional):</label>
                {waypointData.waypoint.narration_url && (
                    <div className="existing-file">
                        <p>Current narration:</p>
                        <audio controls style={{ width: '100%', maxWidth: '400px' }}>
                            <source src={waypointData.waypoint.narration_url} type="audio/mpeg" />
                            <source src={waypointData.waypoint.narration_url} type="audio/wav" />
                            <source src={waypointData.waypoint.narration_url} type="audio/mp3" />
                        </audio>
                    </div>
                )}
                <input
                    type="file"
                    id="narration-upload"
                    accept="audio/*"
                    onChange={(e) => setNarration(e.target.files[0])}
                />
                {narration && <p>New narration file selected: {narration.name}</p>}
            </div>

            <div className="editor-section">
                <label htmlFor="narration-keyframes">Narration / Text Animation (Optional):</label>
                {waypointData.waypoint.keyframes_url && (
                    <div className="existing-file">
                        <p>Current keyframes:</p>
                        <div className="keyframes-preview-box">
                            <iframe 
                                src={waypointData.waypoint.keyframes_url} 
                                style={{ 
                                    width: '100%', 
                                    height: '120px', 
                                    border: '1px solid #ccc', 
                                    borderRadius: '4px',
                                    padding: '8px',
                                    backgroundColor: '#f9f9f9',
                                    fontFamily: 'monospace',
                                    fontSize: '12px'
                                }}
                                title="Keyframes Content"
                            />
                        </div>
                    </div>
                )}
                <input
                    type="file"
                    id="narration-keyframes"
                    accept=".txt"
                    onChange={(e) => setKeyframes(e.target.files[0])}
                />
                {keyframes && <p>New keyframes file selected: {keyframes.name}</p>}
            </div>

            <div className="keyframes-preview">
                {waypointData.waypoint.keyframes_url && waypointData.waypoint.narration_url && (
                    <button className="adm-button blue" onClick={() => setShowPreview(true)}>
                        Preview Keyframes with Narration
                    </button>
                )}
            </div>

            <div className="editor-buttons">
                <button className="adm-button green" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button className="adm-button red" onClick={onClose} disabled={isSaving}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default WaypointEditor;