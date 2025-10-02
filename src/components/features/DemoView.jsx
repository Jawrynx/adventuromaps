/**
 * DemoView.jsx - Interactive waypoint navigation demo interface
 * 
 * This component provides an immersive demo experience for adventure routes,
 * allowing users to navigate through waypoints with rich media content including
 * images, audio guides, and detailed information. Features touch-friendly navigation,
 * keyboard controls, and responsive layout for optimal user experience.
 */

import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import LoadingSpinner from '../ui/LoadingSpinner';
import { getSetting } from '../../services/settingsService';
import './css/DemoView.css';

/**
 * DemoView Component
 * 
 * Interactive demo interface that guides users through adventure waypoints:
 * - Displays waypoint information, images, and audio content
 * - Supports navigation between waypoints with smooth transitions
 * - Handles touch gestures and keyboard navigation
 * - Automatically updates map focus as waypoints change
 * - Manages media playback and image galleries
 * - Conditionally displays narration audio based on user preferences
 * 
 * @param {Array} waypoints - Array of waypoint objects with media and location data
 * @param {Function} onClose - Callback to exit demo mode
 * @param {Function} onWaypointChange - Callback when active waypoint changes (updates map)
 * @param {number} currentWaypointIndex - Index of currently active waypoint
 * @param {boolean} includeNarration - Whether to show narration audio controls
 * @returns {JSX.Element} Interactive demo navigation interface
 */
function DemoView({ waypoints, onClose, onWaypointChange, currentWaypointIndex, includeNarration }) {
    // ========== COMPONENT STATE ==========
    const totalWaypoints = waypoints.length;                    // Total number of waypoints in route
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // Index for image gallery navigation
    const [touchStart, setTouchStart] = useState(null);         // Touch start position for gesture detection
    const [touchEnd, setTouchEnd] = useState(null);             // Touch end position for swipe calculation
    const audioRef = useRef(null);                              // Reference to audio element for auto-play control
    const [keyframes, setKeyframes] = useState([]);             // Parsed keyframes for text highlighting
    const [currentKeyframeIndex, setCurrentKeyframeIndex] = useState(-1); // Currently active keyframe
    const [textSegments, setTextSegments] = useState([]);       // Text split into segments for highlighting
    const [isNarrationEnabled, setIsNarrationEnabled] = useState(includeNarration); // Local narration toggle state
    const [isTransitioning, setIsTransitioning] = useState(false); // Loading state during waypoint transitions
    const [targetWaypointIndex, setTargetWaypointIndex] = useState(currentWaypointIndex); // Target waypoint during transition

    /**
     * Synchronizes local narration state with prop changes
     * 
     * Updates the local narration toggle state when the parent component
     * changes the includeNarration prop to ensure consistency.
     */
    useEffect(() => {
        setIsNarrationEnabled(includeNarration);
    }, [includeNarration]);

    /**
     * Updates map focus when waypoint changes
     * 
     * Notifies parent component to update map view to center on
     * the currently active waypoint for seamless navigation experience.
     */
    useEffect(() => {
        if (totalWaypoints > 0) {
            onWaypointChange(currentWaypointIndex);
        }
    }, [currentWaypointIndex, totalWaypoints, onWaypointChange]);

    /**
     * Resets image gallery when waypoint changes
     * 
     * Ensures that when navigating to a new waypoint, the image
     * gallery starts from the first image rather than maintaining
     * the previous waypoint's image index. Only resets when not transitioning.
     */
    useEffect(() => {
        if (!isTransitioning) {
            setCurrentImageIndex(0);
        }
    }, [currentWaypointIndex, isTransitioning]);

    /**
     * Auto-plays audio when waypoint changes (if narration is enabled)
     * 
     * Automatically starts audio playback when navigating to a new waypoint
     * that has narration audio available and narration is enabled.
     * Only triggers when not transitioning to avoid audio during map panning.
     */
    useEffect(() => {
        if (!isTransitioning && isNarrationEnabled && audioRef.current && waypoints[currentWaypointIndex]?.narration_url) {
            // Small delay to ensure audio element is ready
            const timer = setTimeout(() => {
                audioRef.current.play().catch(error => {
                    // Auto-play was prevented (browser policy), user needs to interact first
                });
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [currentWaypointIndex, isNarrationEnabled, waypoints, isTransitioning]);

    /**
     * Fetches and parses keyframes for text highlighting
     * 
     * Downloads the keyframes file and processes it to create text segments
     * that can be highlighted in sync with audio narration.
     * Only loads when not transitioning to avoid content loading during map panning.
     */
    useEffect(() => {
        const loadKeyframes = async () => {
            const currentWaypoint = waypoints[currentWaypointIndex];
            if (isTransitioning || !currentWaypoint?.keyframes_url || !isNarrationEnabled) {
                if (!isTransitioning) {
                    setKeyframes([]);
                    setTextSegments([{text: currentWaypoint?.description || "", isKeyframe: false}]);
                    setCurrentKeyframeIndex(-1);
                }
                return;
            }

            try {
                // Fetch keyframes text file
                const response = await fetch(currentWaypoint.keyframes_url);
                const keyframesText = await response.text();
                
                // Parse keyframes (format: timestamp:text)
                const parsedKeyframes = keyframesText
                    .split('\n')
                    .filter(line => line.trim())
                    .map(line => {
                        const colonIndex = line.indexOf(':');
                        if (colonIndex === -1) return null;
                        
                        const timestamp = line.substring(0, colonIndex).trim();
                        const text = line.substring(colonIndex + 1).trim();
                        
                        return {
                            time: parseFloat(timestamp),
                            text: text
                        };
                    })
                    .filter(keyframe => keyframe !== null);

                setKeyframes(parsedKeyframes);

                // Split description into segments based on keyframe text
                const description = currentWaypoint.description || "";
                
                // Create segments by finding each keyframe text in the description
                let segments = [];
                let processedText = "";
                let lastIndex = 0;

                // Sort keyframes by position in text (not by time)
                const keyframesWithPositions = parsedKeyframes
                    .map((keyframe, index) => {
                        const position = description.indexOf(keyframe.text);
                        return { ...keyframe, position, keyframeIndex: index };
                    })
                    .filter(kf => kf.position !== -1)
                    .sort((a, b) => a.position - b.position);


                keyframesWithPositions.forEach((keyframe) => {
                    // Add text before this keyframe (including spaces and punctuation)
                    if (keyframe.position > lastIndex) {
                        const beforeText = description.substring(lastIndex, keyframe.position);
                        if (beforeText) { // Include spaces and whitespace
                            segments.push({
                                text: beforeText,
                                isKeyframe: false
                            });
                        }
                    }

                    // Add the keyframe text
                    segments.push({
                        text: keyframe.text,
                        isKeyframe: true,
                        keyframeIndex: keyframe.keyframeIndex
                    });

                    lastIndex = keyframe.position + keyframe.text.length;
                });

                // Add any remaining text after the last keyframe
                if (lastIndex < description.length) {
                    const remainingText = description.substring(lastIndex);
                    if (remainingText) { // Include all remaining text including spaces
                        segments.push({
                            text: remainingText,
                            isKeyframe: false
                        });
                    }
                }

                setTextSegments(segments.length > 0 ? segments : [{text: description, isKeyframe: false}]);
                setCurrentKeyframeIndex(-1);

            } catch (error) {
                console.error('Error loading keyframes:', error);
                setKeyframes([]);
                setTextSegments([{text: currentWaypoint?.description || "", isKeyframe: false}]);
                setCurrentKeyframeIndex(-1);
            }
        };

        loadKeyframes();
    }, [currentWaypointIndex, isNarrationEnabled, waypoints, isTransitioning]);

    /**
     * Updates text highlighting based on audio playback time
     * 
     * Monitors audio current time and highlights the appropriate text segment
     * based on keyframe timestamps for synchronized reading experience.
     */
    useEffect(() => {
        const handleTimeUpdate = () => {
            if (!audioRef.current || keyframes.length === 0) return;

            const currentTime = audioRef.current.currentTime;
            
            // Find the active keyframe based on current audio time
            let activeIndex = -1;
            for (let i = keyframes.length - 1; i >= 0; i--) {
                if (currentTime >= keyframes[i].time) {
                    activeIndex = i;
                    break;
                }
            }

            setCurrentKeyframeIndex(activeIndex);
        };

        if (audioRef.current) {
            audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
            audioRef.current.addEventListener('loadedmetadata', handleTimeUpdate);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
                audioRef.current.removeEventListener('loadedmetadata', handleTimeUpdate);
            }
        };
    }, [keyframes]);

    /**
     * Navigates to the next waypoint or exits demo
     * 
     * Shows loading state, triggers map transition, then loads waypoint content
     * after a delay to allow the cinematic pan to complete. If already at
     * the last waypoint, automatically closes the demo experience.
     */
    const handleNext = () => {
        if (currentWaypointIndex < totalWaypoints - 1) {
            const nextIndex = currentWaypointIndex + 1;
            setIsTransitioning(true);
            setTargetWaypointIndex(nextIndex);
            
            // Trigger map transition immediately
            onWaypointChange(nextIndex);
            
            // Check if auto-advance is enabled to skip transition animations
            const autoAdvance = getSetting('autoAdvanceWaypoints');
            const transitionDuration = autoAdvance ? 100 : 3500; // Skip animation or normal duration
            
            setTimeout(() => {
                setIsTransitioning(false);
            }, transitionDuration);
        } else {
            onClose();
        }
    };

    /**
     * Navigates to the previous waypoint
     * 
     * Shows loading state, triggers map transition, then loads waypoint content
     * after a delay to allow the cinematic pan to complete. Does nothing if
     * already at the first waypoint.
     */
    const handlePrevious = () => {
        if (currentWaypointIndex > 0) {
            const prevIndex = currentWaypointIndex - 1;
            setIsTransitioning(true);
            setTargetWaypointIndex(prevIndex);
            
            // Trigger map transition immediately
            onWaypointChange(prevIndex);
            
            // Check if auto-advance is enabled to skip transition animations
            const autoAdvance = getSetting('autoAdvanceWaypoints');
            const transitionDuration = autoAdvance ? 100 : 3500; // Skip animation or normal duration
            
            setTimeout(() => {
                setIsTransitioning(false);
            }, transitionDuration);
        }
    };

    /**
     * Navigates to previous image in the current waypoint's gallery
     * 
     * Moves back through the image carousel for the current waypoint.
     * Does nothing if already viewing the first image.
     */
    const handleImagePrevious = () => {
        const images = currentWaypoint?.image_urls || [];
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    /**
     * Navigates to next image in the current waypoint's gallery
     * 
     * Advances through the image carousel for the current waypoint.
     * Does nothing if already viewing the last image.
     */
    const handleImageNext = () => {
        const images = currentWaypoint?.image_urls || [];
        if (currentImageIndex < images.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
    };

    /**
     * Jumps directly to a specific image in the gallery
     * 
     * Allows immediate navigation to any image in the current
     * waypoint's gallery using thumbnail or indicator navigation.
     * 
     * @param {number} index - The index of the image to display
     */
    const goToImage = (index) => {
        setCurrentImageIndex(index);
    };

    /**
     * Handles touch start for swipe gesture detection
     * 
     * Records the initial touch position to enable swipe navigation
     * between waypoints on touch-enabled devices.
     * 
     * @param {TouchEvent} e - Touch event containing touch coordinates
     */
    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    /**
     * Tracks touch movement for swipe calculation
     * 
     * Continuously updates touch position during drag to calculate
     * swipe direction and distance for gesture recognition.
     * 
     * @param {TouchEvent} e - Touch event containing current touch coordinates
     */
    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    /**
     * Processes swipe gesture when touch ends
     * 
     * Calculates swipe distance and direction to trigger appropriate
     * navigation actions. Supports left/right swipes for image navigation.
     */
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        // Calculate swipe distance and direction
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;   // Swipe left (next image)
        const isRightSwipe = distance < -50;  // Swipe right (previous image)

        // Trigger appropriate navigation based on swipe direction
        if (isLeftSwipe) {
            handleImageNext();
        } else if (isRightSwipe) {
            handleImagePrevious();
        }
    };

    /**
     * Toggles narration on/off during demo playback
     * 
     * Allows users to enable or disable narration functionality
     * during the demo experience. When disabled, audio will pause
     * and text highlighting will stop. Disabled during transitions.
     */
    const toggleNarration = () => {
        if (isTransitioning) return; // Don't allow toggling during transitions
        
        setIsNarrationEnabled(prev => {
            const newState = !prev;
            
            // If turning off narration, pause any playing audio
            if (!newState && audioRef.current) {
                audioRef.current.pause();
            }
            // If turning on narration and audio exists, play it
            else if (newState && audioRef.current && waypoints[currentWaypointIndex]?.narration_url) {
                audioRef.current.play().catch(error => {
                });
            }
            
            return newState;
        });
    };

    const currentWaypoint = waypoints[currentWaypointIndex];

    if (!currentWaypoint) {
        return null;
    }

    return (
        <div className="demo-container">
            <div className="demo-header">
                <h2>Waypoint Demo</h2>
                <div 
                    className={`narration-indicator ${isNarrationEnabled ? 'enabled' : 'disabled'} ${isTransitioning ? 'transitioning' : ''}`}
                    onClick={toggleNarration}
                    style={{ cursor: isTransitioning ? 'not-allowed' : 'pointer' }}
                >
                    <span>
                        {isTransitioning ? '🚶 Travelling...' : 
                         isNarrationEnabled ? '🔊 Narration Enabled' : '🔇 Narration Disabled'}
                    </span>
                </div>
            </div>
            <div className="waypoint-card">
                {isTransitioning ? (
                    <div className="waypoint-transition">
                        <h3>Travelling to {waypoints[targetWaypointIndex]?.name}...</h3>
                        <LoadingSpinner text="Travelling..." />
                    </div>
                ) : (
                    <>
                        <h3>{currentWaypoint.name}</h3>
                        <div className="waypoint-media">
                            {currentWaypoint.image_urls && currentWaypoint.image_urls.length > 0 && (
                                <>
                                    <div 
                                        className="carousel-container"
                                        style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                                        onTouchStart={onTouchStart}
                                        onTouchMove={onTouchMove}
                                        onTouchEnd={onTouchEnd}
                                    >
                                        {currentWaypoint.image_urls.map((imageUrl, index) => (
                                            <div key={index} className="carousel-slide">
                                                <img src={imageUrl} alt={`${currentWaypoint.name} - Image ${index + 1}`} />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {currentWaypoint.image_urls.length > 1 && (
                                        <>
                                            <button 
                                                className="carousel-nav prev"
                                                onClick={handleImagePrevious}
                                                disabled={currentImageIndex === 0}
                                            >
                                                <FontAwesomeIcon icon={faChevronLeft} />
                                            </button>
                                            <button 
                                                className="carousel-nav next"
                                                onClick={handleImageNext}
                                                disabled={currentImageIndex === currentWaypoint.image_urls.length - 1}
                                            >
                                                <FontAwesomeIcon icon={faChevronRight} />
                                            </button>
                                            
                                            <div className="carousel-indicators">
                                                {currentWaypoint.image_urls.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                                                        onClick={() => goToImage(index)}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        
                        {/* Audio Narration Section - Only displayed when narration is enabled */}
                        {isNarrationEnabled && currentWaypoint.narration_url && (
                            <div className="waypoint-audio" style={{ display: 'none' }}>
                                <audio 
                                    ref={audioRef}
                                    controls 
                                    autoPlay
                                    style={{ width: '100%', marginTop: '10px', display: 'none' }}
                                >
                                    <source src={currentWaypoint.narration_url} type="audio/mpeg" />
                                    <source src={currentWaypoint.narration_url} type="audio/wav" />
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        )}
                        
                        <div className="waypoint-info">
                            <p>
                                {textSegments.map((segment, index) => {
                                    // Handle both string and object formats
                                    if (typeof segment === 'string') {
                                        return <span key={index}>{segment}</span>;
                                    }
                                    
                                    // Render text segment with conditional highlighting
                                    const isHighlighted = segment.isKeyframe && segment.keyframeIndex === currentKeyframeIndex;
                                    
                                    return (
                                        <span
                                            key={index}
                                            className={isHighlighted ? 'text-highlight' : ''}
                                        >
                                            {segment.text}
                                        </span>
                                    );
                                })}
                            </p>
                        </div>
                    </>
                )}
            </div>
            <div className="demo-controls">
                <button 
                    onClick={handlePrevious} 
                    disabled={isTransitioning || currentWaypointIndex === 0}
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <div className="waypoint-counter">
                    {isTransitioning ? `Travelling to ${targetWaypointIndex + 1}` : `${currentWaypointIndex + 1}`} / {waypoints.length}
                </div>
                <button 
                    onClick={handleNext} 
                    disabled={isTransitioning || currentWaypointIndex === waypoints.length - 1}
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>
        </div>
    );
}

export default DemoView;