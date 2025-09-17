import React, { useState, useEffect } from 'react';

function WaypointEditor({ waypointData, itemType, onClose, onSave }) {
    const [description, setDescription] = useState(waypointData.waypoint.description || '');
    const [instructions, setInstructions] = useState(waypointData.waypoint.instructions || '');
    const [image, setImage] = useState(null);
    const [narration, setNarration] = useState(null);
    const [keyframes, setKeyframes] = useState(null);

    useEffect(() => {
        setDescription(waypointData.waypoint.description || '');
        setInstructions(waypointData.waypoint.instructions || '');
        setImage(null);
        setNarration(null);
        setKeyframes(null);
    }, [waypointData]);

    const handleSave = () => {
        const waypointDataToSave = {
            description,
            instructions,
            image,
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
                <label htmlFor="image-upload">Upload Image (Optional):</label>
                <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                />
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