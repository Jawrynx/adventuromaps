import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import './css/DemoView.css';

function DemoView({ waypoints, onClose, onWaypointChange, currentWaypointIndex }) {
    const totalWaypoints = waypoints.length;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    useEffect(() => {
        if (totalWaypoints > 0) {
            onWaypointChange(currentWaypointIndex);
        }
    }, [currentWaypointIndex, totalWaypoints, onWaypointChange]);

    // Reset image index when waypoint changes
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [currentWaypointIndex]);

    const handleNext = () => {
        if (currentWaypointIndex < totalWaypoints - 1) {
            onWaypointChange(currentWaypointIndex + 1);
        } else {
            onClose();
        }
    };

    const handlePrevious = () => {
        if (currentWaypointIndex > 0) {
            onWaypointChange(currentWaypointIndex - 1);
        }
    };

    // Image carousel functions
    const handleImagePrevious = () => {
        const images = currentWaypoint?.image_urls || [];
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    const handleImageNext = () => {
        const images = currentWaypoint?.image_urls || [];
        if (currentImageIndex < images.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
    };

    const goToImage = (index) => {
        setCurrentImageIndex(index);
    };

    // Touch/swipe handlers
    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

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