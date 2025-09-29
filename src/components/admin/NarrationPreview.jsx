/**
 * NarrationPreview.jsx - Preview component for narration and keyframe animations
 * 
 * Provides a preview interface for testing narration audio with keyframe-based
 * text animations. Allows administrators to see how the description text will
 * animate in sync with the audio narration.
 */

import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faStop } from '@fortawesome/free-solid-svg-icons';

/**
 * NarrationPreview Component
 * 
 * Previews narration audio with synchronized text animations based on keyframes.
 * Loads keyframes from a text file and animates the description accordingly.
 * 
 * @param {string} description - The description text to animate
 * @param {string} narrationUrl - URL of the narration audio file
 * @param {string} keyframesUrl - URL of the keyframes text file
 * @param {Function} onClose - Callback to close the preview and return to editor
 * @returns {JSX.Element} The narration preview interface
 */
function NarrationPreview({ description, narrationUrl, keyframesUrl, onClose }) {
    // ========== AUDIO STATE ==========
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    
    // ========== ANIMATION STATE ==========
    const [keyframes, setKeyframes] = useState([]);
    const [currentKeyframe, setCurrentKeyframe] = useState(0);
    const [animatedText, setAnimatedText] = useState('');
    
    // ========== LOADING STATE ==========
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Loads and parses keyframes from the text file
     * 
     * Fetches the keyframes file and parses it into an array of timing objects.
     * Expected format: Each line contains "timestamp:text" (e.g., "0.5:Hello world")
     */
    useEffect(() => {
        const loadKeyframes = async () => {
            if (!keyframesUrl) {
                setError('No keyframes file provided');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(keyframesUrl);
                const keyframesText = await response.text();
                
                // Parse keyframes - expected format: "timestamp:text" per line
                const parsedKeyframes = keyframesText
                    .split('\n')
                    .filter(line => line.trim() !== '')
                    .map(line => {
                        const [timestamp, ...textParts] = line.split(':');
                        return {
                            time: parseFloat(timestamp.trim()),
                            text: textParts.join(':').trim()
                        };
                    })
                    .sort((a, b) => a.time - b.time); // Sort by timestamp

                setKeyframes(parsedKeyframes);
                console.log('Loaded keyframes:', parsedKeyframes);
                
                // Set initial text (first keyframe or description)
                if (parsedKeyframes.length > 0) {
                    setAnimatedText(parsedKeyframes[0].text);
                } else {
                    setAnimatedText(description);
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Failed to load keyframes:', err);
                setError('Failed to load keyframes file');
                setAnimatedText(description); // Fallback to static description
                setLoading(false);
            }
        };

        loadKeyframes();
    }, [keyframesUrl, description]);

    /**
     * Updates animation based on current audio time
     * 
     * Checks the current audio playback time against keyframes
     * and updates the displayed text accordingly.
     */
    useEffect(() => {
        if (keyframes.length === 0) return;

        // Find the appropriate keyframe for current time
        let activeKeyframe = 0;
        for (let i = keyframes.length - 1; i >= 0; i--) {
            if (currentTime >= keyframes[i].time) {
                activeKeyframe = i;
                break;
            }
        }

        // Update text if keyframe changed
        if (activeKeyframe !== currentKeyframe) {
            setCurrentKeyframe(activeKeyframe);
            setAnimatedText(keyframes[activeKeyframe].text);
        }
    }, [currentTime, keyframes, currentKeyframe]);

    /**
     * Handles audio time updates during playback
     */
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    /**
     * Handles when audio metadata is loaded
     */
    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    /**
     * Handles play button click
     */
    const handlePlay = () => {
        if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    /**
     * Handles pause button click
     */
    const handlePause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    /**
     * Handles stop button click
     */
    const handleStop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            setCurrentTime(0);
            setCurrentKeyframe(0);
            
            // Reset to first keyframe or description
            if (keyframes.length > 0) {
                setAnimatedText(keyframes[0].text);
            } else {
                setAnimatedText(description);
            }
        }
    };

    /**
     * Handles audio ended event
     */
    const handleEnded = () => {
        setIsPlaying(false);
    };

    /**
     * Formats time in MM:SS format
     */
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="narration-preview">
                <div className="preview-loading">
                    <h3>Loading Preview...</h3>
                </div>
                <div className="loading-spinner">Loading keyframes...</div>
            </div>
        );
    }

    return (
        <div className="narration-preview">
            <div className="preview-header">
                <h3>Narration & Text Animation Preview</h3>
                {error && <p className="error">{error}</p>}
            </div>

            {/* Audio Element */}
            <audio
                ref={audioRef}
                src={narrationUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                preload="metadata"
            />

            {/* Animated Text Display */}
            <div className="animated-text-display">
                <div className="text-content">
                    {animatedText || description}
                </div>
            </div>

            {/* Keyframes Info */}
            {keyframes.length > 0 && (
                <div className="keyframes-info">
                    <p>Keyframes loaded: {keyframes.length}</p>
                    <p>Current keyframe: {currentKeyframe + 1} / {keyframes.length}</p>
                </div>
            )}

            {/* Audio Controls */}
            <div className="audio-controls">
                <button 
                    className="adm-button green" 
                    onClick={handlePlay} 
                    disabled={isPlaying || !narrationUrl}
                >
                    <FontAwesomeIcon icon={faPlay} /> Play
                </button>
                
                <button 
                    className="adm-button yellow" 
                    onClick={handlePause} 
                    disabled={!isPlaying}
                >
                    <FontAwesomeIcon icon={faPause} /> Pause
                </button>
                
                <button 
                    className="adm-button red" 
                    onClick={handleStop} 
                    disabled={!narrationUrl}
                >
                    <FontAwesomeIcon icon={faStop} /> Stop
                </button>
            </div>

            {/* Progress Bar */}
            <div className="progress-section">
                <div className="time-display">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>
                <div className="progress-bar">
                    <div 
                        className="progress-fill"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    ></div>
                </div>
            </div>

            {/* Instructions */}
            <div className="instructions">
                <h4>Keyframe Format Instructions:</h4>
                <p>Each line in your keyframes file should follow this format:</p>
                <code>timestamp:text</code>
                <p>Example:</p>
                <pre>
{`0.0:Welcome to this location!
2.5:Here you can see the beautiful scenery.
5.0:Take a moment to look around.
8.0:When you're ready, continue to the next point.`}
                </pre>
            </div>

            {/* Close Button */}
            <div className="preview-actions">
                <button className="adm-button blue" onClick={onClose}>
                    Done - Return to Editor
                </button>
            </div>
        </div>
    );
}

export default NarrationPreview;