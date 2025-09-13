import React from 'react';

function WaypointEditor({ waypointData, onClose }) {
    const [description, setDescription] = React.useState('');
    const [image, setImage] = React.useState(null);
    const [narration, setNarration] = React.useState(null);
    const [keyframes, setKeyframes] = React.useState(null);

    const handleSave = () => {
        console.log("Saving data for waypoint:", waypointData.waypoint.name);
        console.log("Description:", description);
        console.log("Image:", image);
        console.log("Narration:", narration);
        console.log("Keyframes:", keyframes);

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
                    accept="txt"
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