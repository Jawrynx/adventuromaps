// src/components/WaypointEditor.jsx

import React from 'react';

function WaypointEditor({ waypointData, itemType, onClose }) {
    const [description, setDescription] = React.useState('');
    const [instructions, setInstructions] = React.useState('');
    const [image, setImage] = React.useState(null);
    const [narration, setNarration] = React.useState(null);
    const [keyframes, setKeyframes] = React.useState(null);

    const handleSave = () => {
        console.log("Saving data for waypoint:", waypointData.waypoint.name);
        console.log("Description:", description);
        if (itemType === 'adventure') {
            console.log("Instructions:", instructions);
        }
        console.log("Image:", image);
        console.log("Narration:", narration);
        console.log("Keyframes:", keyframes);

        const waypointDataToSave = {
            description,
            image,
            narration,
            keyframes
        };

        if (itemType === 'adventure') {
            waypointDataToSave.instructions = instructions;
        }

        // You would typically pass waypointDataToSave back to the parent component
        // or a state management solution to handle the actual saving to Firestore.
        // For now, we'll just close the editor.

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