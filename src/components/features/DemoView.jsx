/**
 * DemoView.jsx - Interactive waypoint navigation demo interface
 * 
 * This component provides an immersive demo experience for adventure routes,
 * allowing users to navigate through waypoints with rich media content including
 * images, audio guides, and detailed information. Features touch-friendly navigation,
 * keyboard controls, and responsive layout for optimal user experience.
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
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
     * the previous waypoint's image index.
     */
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [currentWaypointIndex]);

    /**
     * Navigates to the next waypoint or exits demo
     * 
     * Advances to the next waypoint in the sequence. If already at
     * the last waypoint, automatically closes the demo experience.
     */
    const handleNext = () => {
        if (currentWaypointIndex < totalWaypoints - 1) {
            onWaypointChange(currentWaypointIndex + 1);
        } else {
            onClose();
        }
    };

    /**
     * Navigates to the previous waypoint
     * 
     * Moves back to the previous waypoint in the sequence.
     * Does nothing if already at the first waypoint.
     */
    const handlePrevious = () => {
        if (currentWaypointIndex > 0) {
            onWaypointChange(currentWaypointIndex - 1);
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

    const currentWaypoint = waypoints[currentWaypointIndex];

    if (!currentWaypoint) {
        return null;
    }

    return (
        <div className="demo-container">
            <div className="demo-header">
                <h2>Waypoint Demo</h2>
                {includeNarration && (
                    <div className="narration-indicator">
                        <span>🔊 Narration Enabled</span>
                    </div>
                )}
            </div>
            <div className="waypoint-card">
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
                {includeNarration && currentWaypoint.narration_url && (
                    <div className="waypoint-audio">
                        <h4>🎧 Audio Guide</h4>
                        <audio controls style={{ width: '100%', marginTop: '10px' }}>
                            <source src={currentWaypoint.audio_url} type="audio/mpeg" />
                            <source src={currentWaypoint.audio_url} type="audio/wav" />
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                )}
                
                <div className="waypoint-info">
                    <p>{currentWaypoint.description}</p>
                </div>
            </div>
            <div className="demo-controls">
                <button onClick={handlePrevious} disabled={currentWaypointIndex === 0}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <div className="waypoint-counter">
                    {currentWaypointIndex + 1} / {waypoints.length}
                </div>
                <button onClick={handleNext} disabled={currentWaypointIndex === waypoints.length - 1}>
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>
        </div>
    );
}

export default DemoView;