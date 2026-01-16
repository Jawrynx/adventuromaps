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
    
    // ========== TTS STATE ==========
    const [isUsingTTS, setIsUsingTTS] = useState(false);
    const [ttsUtterance, setTtsUtterance] = useState(null);
    const [ttsStartTime, setTtsStartTime] = useState(0);
    
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
                // Set initial text (first keyframe or description)
                if (parsedKeyframes.length > 0) {
                    setAnimatedText(parsedKeyframes[0].text);
                } else {
                    setAnimatedText(description);
                }
                
                // Check if this is a TTS-generated preview (blob URL for keyframes indicates TTS)
                if (keyframesUrl && keyframesUrl.startsWith('blob:')) {
                    setIsUsingTTS(true);
                    
                    // Calculate duration from keyframes for TTS
                    if (parsedKeyframes.length > 0) {
                        const lastKeyframe = parsedKeyframes[parsedKeyframes.length - 1];
                        const estimatedDuration = lastKeyframe.time + 2; // Add buffer
                        setDuration(estimatedDuration);
                    }
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

        console.log('Keyframe update:', { currentTime, activeKeyframe, text: keyframes[activeKeyframe]?.text }); // Debug log

        // Update text if keyframe changed
        if (activeKeyframe !== currentKeyframe) {
            setCurrentKeyframe(activeKeyframe);
            setAnimatedText(keyframes[activeKeyframe].text);
            console.log('Text updated to:', keyframes[activeKeyframe].text); // Debug log
        }
    }, [currentTime, keyframes, currentKeyframe]);

    /**
     * Handles audio time updates during playback
     */
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const newTime = audioRef.current.currentTime;
            console.log('Audio time update:', newTime); // Debug log
            setCurrentTime(newTime);
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
    const handlePlay = async () => {
        if (isUsingTTS) {
            // Use Speech Synthesis API for TTS-generated content
            playTTSContent();
        } else if (audioRef.current) {
            // Use regular audio playback for uploaded files
            playRegularAudio();
        }
    };
    
    /**
     * Plays TTS content using Speech Synthesis API
     */
    const playTTSContent = () => {
        if (!window.speechSynthesis) {
            setError('Speech synthesis not supported in this browser');
            return;
        }
        
        // Stop any existing speech
        speechSynthesis.cancel();
        
        // Create new utterance
        const utterance = new SpeechSynthesisUtterance(description);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        // Try to use a high-quality voice
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en') && 
            (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.localService === false)
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        utterance.onstart = () => {
            console.log('TTS playback started');
            setIsPlaying(true);
            setTtsStartTime(performance.now());
            setError(null);
            
            // Start time tracking
            startTTSTimeTracking();
        };
        
        utterance.onend = () => {
            console.log('TTS playback ended');
            setIsPlaying(false);
            setCurrentTime(0);
            setCurrentKeyframe(0);
            
            // Reset to first keyframe
            if (keyframes.length > 0) {
                setAnimatedText(keyframes[0].text);
            } else {
                setAnimatedText(description);
            }
        };
        
        utterance.onerror = (event) => {
            console.error('TTS error:', event);
            setError('TTS playback failed: ' + event.error);
            setIsPlaying(false);
        };
        
        setTtsUtterance(utterance);
        speechSynthesis.speak(utterance);
    };
    
    /**
     * Plays regular audio file
     */
    const playRegularAudio = async () => {
        try {
            console.log('Attempting to play audio:', {
                src: audioRef.current.src,
                readyState: audioRef.current.readyState,
                networkState: audioRef.current.networkState,
                duration: audioRef.current.duration
            });

            // Check if audio has a valid source
            if (!audioRef.current.src) {
                console.error('No audio source available');
                setError('No audio source available');
                return;
            }
            
            // Try to load the audio if it's not ready
            if (audioRef.current.readyState === 0) {
                console.log('Loading audio...');
                audioRef.current.load();
                
                // Wait a moment for loading to start
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Check readiness again
            if (audioRef.current.readyState < 2) {
                console.log('Audio not ready, forcing load and trying again...');
                audioRef.current.load();
                
                // Wait for loadeddata event or timeout
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Audio loading timeout'));
                    }, 5000);

                    const onLoadedData = () => {
                        clearTimeout(timeout);
                        audioRef.current.removeEventListener('loadeddata', onLoadedData);
                        resolve();
                    };

                    audioRef.current.addEventListener('loadeddata', onLoadedData);
                });
            }
            
            console.log('Playing audio with readyState:', audioRef.current.readyState);
            await audioRef.current.play();
            setIsPlaying(true);
            setError(null); // Clear any previous errors
            
        } catch (err) {
            console.error('Failed to play audio:', err);
            if (err.name === 'NotSupportedError') {
                setError('Audio format not supported or corrupted audio file');
            } else if (err.name === 'NotAllowedError') {
                setError('Audio playback was prevented - please interact with the page first');
            } else {
                setError(`Failed to play audio: ${err.message}`);
            }
            setIsPlaying(false);
        }
    };
    
    /**
     * Starts time tracking for TTS playback
     */
    const startTTSTimeTracking = () => {
        const trackTime = () => {
            if (!isPlaying) return;
            
            const elapsed = (performance.now() - ttsStartTime) / 1000;
            setCurrentTime(elapsed);
            
            if (isPlaying && speechSynthesis.speaking) {
                requestAnimationFrame(trackTime);
            }
        };
        
        requestAnimationFrame(trackTime);
    };

    /**
     * Handles pause button click
     */
    const handlePause = () => {
        if (isUsingTTS) {
            speechSynthesis.pause();
            setIsPlaying(false);
        } else if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    /**
     * Handles audio loading errors
     */
    const handleAudioError = (e) => {
        console.error('Audio loading error:', e);
        setError('Failed to load audio file');
        setIsPlaying(false);
    };

    /**
     * Handles audio loading start
     */
    const handleLoadStart = () => {
        setError(null);
    };

    /**
     * Handles when audio can start playing
     */
    const handleCanPlay = () => {
        setError(null);
    };

    /**
     * Simulates keyframe animation without audio
     */
    const simulateKeyframeAnimation = () => {
        if (keyframes.length === 0) return;
        
        setCurrentKeyframe(0);
        setAnimatedText(keyframes[0].text);
        
        let frameIndex = 0;
        const animationInterval = setInterval(() => {
            frameIndex++;
            if (frameIndex < keyframes.length) {
                setCurrentKeyframe(frameIndex);
                setAnimatedText(keyframes[frameIndex].text);
            } else {
                clearInterval(animationInterval);
            }
        }, 2000); // Change text every 2 seconds for simulation
    };

    /**
     * Handles stop button click
     */
    const handleStop = () => {
        if (isUsingTTS) {
            speechSynthesis.cancel();
            setIsPlaying(false);
        } else if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
        
        setCurrentTime(0);
        setCurrentKeyframe(0);
        
        // Reset to first keyframe or description
        if (keyframes.length > 0) {
            setAnimatedText(keyframes[0].text);
        } else {
            setAnimatedText(description);
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
        if (!time || isNaN(time) || !isFinite(time)) {
            return '0:00';
        }
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
                {/* Debug Info */}
                <div className="debug-info" style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                    <div>Mode: {isUsingTTS ? 'TTS Speech Synthesis' : 'Audio File'}</div>
                    <div>Audio Source: {narrationUrl ? 'Available' : 'Missing'}</div>
                    {!isUsingTTS && (
                        <>
                            <div>Ready State: {audioRef.current?.readyState || 'Not loaded'} (0=Empty, 1=Metadata, 2=Current, 3=Future, 4=Enough)</div>
                            <div>Network State: {audioRef.current?.networkState || 'Unknown'}</div>
                            <div>Duration: {audioRef.current?.duration || 'Unknown'}</div>
                        </>
                    )}
                    <div>Current Time: {currentTime.toFixed(2)}s</div>
                    {narrationUrl && (
                        <div>URL Type: {narrationUrl.startsWith('blob:') ? 'Blob URL' : 'Regular URL'}</div>
                    )}
                    <div>Keyframes: {keyframes.length} loaded</div>
                    {isUsingTTS && <div style={{color: '#16a34a'}}>Using live TTS speech synthesis for clear audio</div>}
                </div>
            </div>

            {/* Audio Element */}
            <audio
                ref={audioRef}
                src={narrationUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onError={handleAudioError}
                onLoadStart={handleLoadStart}
                onCanPlay={handleCanPlay}
                onLoadedData={() => console.log('Audio data loaded')}
                onCanPlayThrough={() => console.log('Audio can play through')}
                preload="auto"
                crossOrigin="anonymous"
            />

            {/* Animated Text Display */}
            <div className="animated-text-display">
                <div className="text-content" style={{
                    padding: '20px',
                    backgroundColor: '#f0f9ff',
                    border: '2px solid #3b82f6',
                    borderRadius: '8px',
                    fontSize: '18px',
                    lineHeight: '1.6',
                    minHeight: '100px',
                    transition: 'all 0.3s ease-in-out'
                }}>
                    {animatedText || description}
                </div>
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                    Currently showing: Keyframe {currentKeyframe + 1} of {keyframes.length || 1}
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
                    disabled={isPlaying || (!narrationUrl && !isUsingTTS)}
                    title={isUsingTTS ? "Play TTS speech synthesis" : !narrationUrl ? "No audio source available" : "Play audio"}
                >
                    <FontAwesomeIcon icon={faPlay} /> Play {isUsingTTS ? 'TTS' : 'Audio'}
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
                    disabled={!narrationUrl && !isUsingTTS}
                >
                    <FontAwesomeIcon icon={faStop} /> Stop
                </button>
                
                {/* Alternative: Simulate keyframes without audio */}
                {!narrationUrl && !isUsingTTS && keyframes.length > 0 && (
                    <button 
                        className="adm-button blue" 
                        onClick={() => simulateKeyframeAnimation()}
                    >
                        <FontAwesomeIcon icon={faPlay} /> Simulate Animation
                    </button>
                )}
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