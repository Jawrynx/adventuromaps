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
import { generateTTSWithTimestampsFunction } from '../../services/firebase';
import useAlert from '../../hooks/useAlert';
import './css/NarrationPreview.css';

/**
 * WaypointEditor Components
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
    const { showAlert, AlertComponent } = useAlert();
    
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
    
    // ========== TTS STATE ==========
    const [ttsEnabled, setTtsEnabled] = useState(false);        // Whether to use TTS for narration
    const [isGeneratingTTS, setIsGeneratingTTS] = useState(false); // TTS generation in progress
    const [generatedTTSBlob, setGeneratedTTSBlob] = useState(null); // Generated TTS audio blob
    const [generatedKeyframesBlob, setGeneratedKeyframesBlob] = useState(null); // Generated keyframes blob
    const [maxKeyframeTime, setMaxKeyframeTime] = useState(null); // Max keyframe time for scaling
    
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
     * Generates TTS audio from description text
     * 
     * Uses the Web Speech API to generate audio narration from the description.
     */
    const generateTTS = async () => {
        if (!description.trim()) {
            showAlert('Please enter a description first before generating TTS.', 'Notice', 'warning');
            return;
        }

        if (!window.speechSynthesis) {
            showAlert('Text-to-Speech is not supported in your browser.', 'Error', 'error');
            return;
        }

        setIsGeneratingTTS(true);

        try {
            // Generate TTS audio
            await generateTTSAudio(description);

        } catch (error) {
            console.error('TTS Generation failed:', error);
            showAlert('Failed to generate TTS. Please try again.', 'Error', 'error');
        } finally {
            setIsGeneratingTTS(false);
        }
    };

    /**
     * Downloads the generated TTS audio as MP3 file
     */
    const downloadTTSAudio = () => {
        if (!generatedTTSBlob) {
            showAlert('No TTS audio generated yet. Please generate TTS first.', 'Notice', 'warning');
            return;
        }

        // Create download link
        const url = URL.createObjectURL(generatedTTSBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `waypoint-${waypointData.waypointIndex + 1}-narration.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    /**
     * Downloads the generated keyframes as text file
     */
    const downloadTTSKeyframes = () => {
        if (!generatedKeyframesBlob) {
            showAlert('No keyframes generated yet. Please generate TTS first.', 'Notice', 'warning');
            return;
        }

        // Create download link
        const url = URL.createObjectURL(generatedKeyframesBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `waypoint-${waypointData.waypointIndex + 1}-keyframes.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    /**
     * Generates TTS audio using Firebase Cloud Function with Google Cloud Text-to-Speech
     * Uses proper OAuth2 service account authentication on the server side
     * 
     * @param {string} text - Text to convert to speech
     */
    const generateTTSAudio = async (text) => {
        try {
            console.log('Generating TTS audio via Firebase Cloud Function...');
            
            // Call the Firebase Cloud Function for TTS with timestamps
            const result = await generateTTSWithTimestampsFunction({
                text: text,
                voiceConfig: {
                    languageCode: 'en-GB', // English UK
                    name: 'en-GB-Neural2-C', // High-quality female neural voice
                    ssmlGender: 'FEMALE' // NEUTRAL not supported by Google TTS
                }
            });
            
            const data = result.data;
            console.log('TTS response received from Cloud Function:', data);
            
            if (!data.success) {
                throw new Error('TTS generation failed on server');
            }
            
            // Convert base64 audio to blob
            const audioBytes = atob(data.audioContent);
            const audioArray = new Uint8Array(audioBytes.length);
            for (let i = 0; i < audioBytes.length; i++) {
                audioArray[i] = audioBytes.charCodeAt(i);
            }
            
            const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });
            setGeneratedTTSBlob(audioBlob);
            
            // Use keyframes from the Cloud Function response
            if (data.keyframes && data.keyframes.length > 0) {
                const keyframesText = data.keyframes.map(kf => `${kf.time.toFixed(2)}:${kf.text}`).join('\n');
                const keyframesBlob = new Blob([keyframesText], { type: 'text/plain' });
                setGeneratedKeyframesBlob(keyframesBlob);
                // Store maxKeyframeTime for frontend scaling
                setMaxKeyframeTime(data.maxKeyframeTime || data.keyframes[data.keyframes.length - 1].time);
                console.log('Received keyframes from Cloud Function:', data.keyframes.length, 'maxTime:', data.maxKeyframeTime);
            } else {
                console.warn('No keyframes received from Cloud Function, generating fallback...');
                // Fallback: generate basic keyframes
                const fallbackKeyframes = generateFallbackKeyframes(text);
                const keyframesText = fallbackKeyframes.map(kf => `${kf.time.toFixed(2)}:${kf.text}`).join('\n');
                const keyframesBlob = new Blob([keyframesText], { type: 'text/plain' });
                setGeneratedKeyframesBlob(keyframesBlob);
            }
            
            console.log('TTS audio and keyframes generated successfully');
            
        } catch (error) {
            console.error('Google Cloud TTS generation failed:', error);
            
            // Show user-friendly error message
            let errorMessage = error.message || 'Unknown error';
            if (error.code === 'functions/internal') {
                errorMessage = 'Server error during TTS generation. Please try again.';
            } else if (error.code === 'functions/unavailable') {
                errorMessage = 'TTS service is temporarily unavailable. Please try again later.';
            } else if (error.code === 'functions/permission-denied') {
                errorMessage = 'Permission denied. Please check Firebase function permissions.';
            }
            
            showAlert(`TTS Generation Failed:\n\n${errorMessage}\n\nYou can still upload audio manually using the file upload below.`, 'TTS Error', 'error');
            throw error;
        }
    };
    
    /**
     * Generates fallback keyframes when no time offsets are available
     * 
     * @param {string} text - Original text
     * @returns {Array} Array of keyframe objects
     */
    const generateFallbackKeyframes = (text) => {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const avgWordsPerSecond = 3;
        let currentTime = 0;
        let currentText = '';
        const keyframes = [];
        
        sentences.forEach((sentence, index) => {
            const wordCount = sentence.trim().split(/\s+/).length;
            const duration = Math.max(wordCount / avgWordsPerSecond, 1);
            
            currentText += (index > 0 ? '. ' : '') + sentence.trim();
            
            keyframes.push({
                time: currentTime,
                text: currentText + (index < sentences.length - 1 ? '.' : '')
            });
            
            currentTime += duration + 0.5;
        });
        
        return keyframes;
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
                narration: ttsEnabled && generatedTTSBlob ? generatedTTSBlob : narration,           // Use TTS or uploaded audio
                keyframes: keyframes || (ttsEnabled && generatedKeyframesBlob ? generatedKeyframesBlob : null), // Use uploaded or generated keyframes
                // Preserve existing narration and keyframes URLs if no new files are uploaded
                narration_url: (ttsEnabled && generatedTTSBlob) || narration ? undefined : waypointData.waypoint.narration_url,
                keyframes_url: (keyframes || (ttsEnabled && generatedKeyframesBlob)) ? undefined : waypointData.waypoint.keyframes_url
            };

            // Call parent save handler with compiled data
            await onSave(waypointData.routeId, waypointData.waypointIndex, waypointDataToSave);
            onClose(); // Close editor after successful save
        } catch (error) {
            console.error('Failed to save waypoint:', error);
            showAlert('Failed to save waypoint. Please try again.', 'Error', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Show preview component if in preview mode
    if (showPreview) {
        // Create temporary URLs for generated content if using TTS
        let previewNarrationUrl = waypointData.waypoint.narration_url;
        let previewKeyframesUrl = waypointData.waypoint.keyframes_url;
        
        if (ttsEnabled && generatedTTSBlob) {
            // Use generated TTS audio for preview
            previewNarrationUrl = URL.createObjectURL(generatedTTSBlob);
        }
        
        // Use uploaded keyframes if available, or generated keyframes from TTS
        if (keyframes) {
            previewKeyframesUrl = URL.createObjectURL(keyframes);
        } else if (ttsEnabled && generatedKeyframesBlob) {
            previewKeyframesUrl = URL.createObjectURL(generatedKeyframesBlob);
        }
        
        return (
            <NarrationPreview
                description={description}
                narrationUrl={previewNarrationUrl}
                keyframesUrl={previewKeyframesUrl}
                maxKeyframeTime={ttsEnabled ? maxKeyframeTime : null}
                onClose={() => {
                    setShowPreview(false);
                    // Clean up temporary URLs if they were created
                    if (ttsEnabled && generatedKeyframesBlob) {
                        if (previewNarrationUrl && previewNarrationUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(previewNarrationUrl);
                        }
                        if (previewKeyframesUrl && previewKeyframesUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(previewKeyframesUrl);
                        }
                    }
                }}
            />
        );
    }

    return (
        <>
            {AlertComponent}
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
                
                {/* TTS Option */}
                <div className="tts-option" style={{ 
                    margin: '10px 0', 
                    width: '100%', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    backgroundColor: ttsEnabled ? '#f0f9ff' : '#f9fafb',
                    borderColor: ttsEnabled ? '#3b82f6' : '#e5e7eb'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '5px' }}>
                        <input
                            type="checkbox"
                            id="tts-enabled"
                            checked={ttsEnabled}
                            onChange={(e) => {
                                setTtsEnabled(e.target.checked);
                                if (!e.target.checked) {
                                    setGeneratedTTSBlob(null);
                                    setGeneratedKeyframesBlob(null);
                                }
                            }}
                            style={{ transform: 'scale(1.2)' }}
                        />
                        <label htmlFor="tts-enabled" style={{ fontWeight: '600', color: ttsEnabled ? '#1d4ed8' : '#374151' }}>
                            Generate TTS from Description
                        </label>
                    </div>
                    
                    {ttsEnabled && (
                        <div style={{ marginLeft: '10px' }}>
                            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '10px' }}>
                                This will generate audio narration from your description using Google Cloud Text-to-Speech with English UK voice.
                            </p>
                            <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#dcfce7', borderRadius: '4px', border: '1px solid #16a34a' }}>
                                <p style={{ fontSize: '12px', color: '#15803d', margin: '0', fontWeight: '600' }}>
                                    ✅ TTS Service Ready
                                </p>
                                <p style={{ fontSize: '11px', color: '#15803d', margin: '4px 0 0 0' }}>
                                    Using Google Cloud TTS via Firebase Cloud Functions with automatic word-level timestamps for keyframe generation.
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={generateTTS}
                                    disabled={isGeneratingTTS || !description.trim()}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        backgroundColor: isGeneratingTTS ? '#9ca3af' : '#3b82f6',
                                        color: 'white',
                                        fontWeight: '600',
                                        cursor: isGeneratingTTS || !description.trim() ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isGeneratingTTS && description.trim()) {
                                            e.target.style.backgroundColor = '#2563eb';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isGeneratingTTS && description.trim()) {
                                            e.target.style.backgroundColor = '#3b82f6';
                                        }
                                    }}
                                >
                                    {isGeneratingTTS ? 'Generating...' : 'Generate TTS Audio'}
                                </button>
                                
                                {generatedTTSBlob && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={downloadTTSAudio}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                backgroundColor: '#16a34a',
                                                color: 'white',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = '#15803d';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = '#16a34a';
                                            }}
                                        >
                                            📥 Save Audio
                                        </button>
                                        
                                        {generatedKeyframesBlob && (
                                            <button
                                                type="button"
                                                onClick={downloadTTSKeyframes}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    backgroundColor: '#7c3aed',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.backgroundColor = '#6d28d9';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.backgroundColor = '#7c3aed';
                                                }}
                                            >
                                                📄 Save Keyframes
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                            
                            {generatedTTSBlob && (
                                <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#dcfce7', borderRadius: '4px', border: '1px solid #16a34a' }}>
                                    <p style={{ fontSize: '14px', color: '#15803d', margin: '0' }}>
                                        ✓ TTS audio and keyframes generated successfully with Google Cloud AI! {generatedKeyframesBlob ? 'Both audio and keyframes are ready for download and preview.' : 'Audio is ready - keyframes generation in progress...'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Manual Upload Option */}
                {!ttsEnabled && (
                    <>
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
                    </>
                )}
            </div>

            <div className="editor-section">
                <label htmlFor="narration-keyframes">Keyframes for Text Animation (Optional):</label>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '10px' }}>
                    Upload a text file with timestamps for synchronized text animation. Format: "timestamp:text" (e.g., "0.0:Welcome to this location!")
                </p>
                
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
                {/* Show preview button if we have narration and keyframes */}
                {((waypointData.waypoint.keyframes_url && waypointData.waypoint.narration_url) || 
                  (waypointData.waypoint.keyframes_url && ttsEnabled && generatedTTSBlob) ||
                  (keyframes && waypointData.waypoint.narration_url) ||
                  (keyframes && ttsEnabled && generatedTTSBlob) ||
                  (generatedKeyframesBlob && ttsEnabled && generatedTTSBlob)) && (
                    <button className="adm-button blue" onClick={() => setShowPreview(true)}>
                        Preview Keyframes with Narration
                    </button>
                )}
                
                {/* Show helpful message about keyframes */}
                {((ttsEnabled && generatedTTSBlob) || waypointData.waypoint.narration_url) && 
                 !waypointData.waypoint.keyframes_url && !keyframes && (
                    <div style={{ 
                        marginTop: '10px',
                        padding: '10px',
                        backgroundColor: '#fef3c7',
                        borderRadius: '6px',
                        border: '1px solid #f59e0b'
                    }}>
                        <p style={{ fontSize: '14px', color: '#92400e', margin: 0 }}>
                            💡 Upload a keyframes file above to enable synchronized text animation preview.
                        </p>
                    </div>
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
        </>
    );
}

export default WaypointEditor;