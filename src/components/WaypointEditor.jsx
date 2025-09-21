import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function WaypointEditor({ waypointData, itemType, onClose, onSave }) {
    const [description, setDescription] = useState(waypointData.waypoint.description || '');
    const [instructions, setInstructions] = useState(waypointData.waypoint.instructions || '');
    const [images, setImages] = useState([]);
    const [previewImageUrls, setPreviewImageUrls] = useState([]);
    const [narration, setNarration] = useState(null);
    const [keyframes, setKeyframes] = useState(null);

    useEffect(() => {
        setDescription(waypointData.waypoint.description || '');
        setInstructions(waypointData.waypoint.instructions || '');
        setImages([]);
        setNarration(null);
        setKeyframes(null);

        if (waypointData.waypoint.image_urls && waypointData.waypoint.image_urls.length > 0) {
            setPreviewImageUrls(waypointData.waypoint.image_urls);
        } else {
            setPreviewImageUrls([]);
        }
    }, [waypointData]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = [...images, ...files];
        setImages(newImages);

        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewImageUrls(prevUrls => [...prevUrls, ...newPreviewUrls]);
    };

    const handleRemoveImage = (indexToRemove) => {
        setPreviewImageUrls(prevUrls => {
            const newUrls = prevUrls.filter((_, index) => index !== indexToRemove);
            return newUrls;
        });

        setImages(prevFiles => {
            const newFiles = prevFiles.filter((_, index) => index !== indexToRemove);
            return newFiles;
        });
    };

    const handleSave = () => {
        const waypointDataToSave = {
            description,
            instructions,
            images,
            narration,
            keyframes
        };

        onSave(waypointData.routeId, waypointData.waypointIndex, waypointDataToSave);
        onClose();
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
                    {previewImageUrls.map((url, index) => (
                        <div key={index} className="image">
                            <button className='remove-image' onClick={() => handleRemoveImage(index)}>
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                            <img src={url} alt={`Waypoint Preview ${index + 1}`} />
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
                <button className="adm-button green" onClick={handleSave}>Save</button>
                <button className="adm-button red" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
}

export default WaypointEditor;