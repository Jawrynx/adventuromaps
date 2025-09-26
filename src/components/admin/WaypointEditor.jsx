import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function WaypointEditor({ waypointData, itemType, onClose, onSave }) {
    const [description, setDescription] = useState(waypointData.waypoint.description || '');
    const [instructions, setInstructions] = useState(waypointData.waypoint.instructions || '');
    const [images, setImages] = useState([]);
    const [existingImageUrls, setExistingImageUrls] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [narration, setNarration] = useState(null);
    const [keyframes, setKeyframes] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setDescription(waypointData.waypoint.description || '');
        setInstructions(waypointData.waypoint.instructions || '');
        setImages([]);
        setNarration(null);
        setKeyframes(null);
        setNewImagePreviews([]);

        if (waypointData.waypoint.image_urls && waypointData.waypoint.image_urls.length > 0) {
            setExistingImageUrls(waypointData.waypoint.image_urls);
        } else {
            setExistingImageUrls([]);
        }
    }, [waypointData]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = [...images, ...files];
        setImages(newImages);

        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setNewImagePreviews(prevPreviews => [...prevPreviews, ...newPreviewUrls]);
    };

    const handleRemoveImage = (indexToRemove, isExisting) => {
        if (isExisting) {
            setExistingImageUrls(prevUrls => {
                const newUrls = prevUrls.filter((_, index) => index !== indexToRemove);
                return newUrls;
            });
        } else {
            const newImageIndex = indexToRemove - existingImageUrls.length;
            setNewImagePreviews(prevPreviews => {
                const newPreviews = prevPreviews.filter((_, index) => index !== newImageIndex);
                return newPreviews;
            });
            
            setImages(prevFiles => {
                const newFiles = prevFiles.filter((_, index) => index !== newImageIndex);
                return newFiles;
            });
        }
    };

    const handleSave = async () => {
        if (isSaving) return;
        
        setIsSaving(true);
        
        try {
            const waypointDataToSave = {
                description,
                instructions,
                images,
                existingImageUrls,
                narration,
                keyframes
            };

            await onSave(waypointData.routeId, waypointData.waypointIndex, waypointDataToSave);
            onClose();
        } catch (error) {
            console.error('Failed to save waypoint:', error);
            alert('Failed to save waypoint. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

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
                <input
                    type="file"
                    id="narration-upload"
                    accept="audio/*"
                    onChange={(e) => setNarration(e.target.files[0])}
                />
            </div>

            <div className="editor-section">
                <label htmlFor="narration-keyframes">Narration / Text Animation (Optional):</label>
                <input
                    type="file"
                    id="narration-keyframes"
                    accept=".txt"
                    onChange={(e) => setKeyframes(e.target.files[0])}
                />
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