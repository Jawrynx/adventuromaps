import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

function DemoView({ waypoints, onClose, onWaypointChange, currentWaypointIndex }) {
    const totalWaypoints = waypoints.length;
    
    useEffect(() => {
        if (totalWaypoints > 0) {
            onWaypointChange(currentWaypointIndex);
        }
    }, [currentWaypointIndex, totalWaypoints, onWaypointChange]);

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

    const currentWaypoint = waypoints[currentWaypointIndex];

    if (!currentWaypoint) {
        return null;
    }

    return (
        <div className="demo-container">
            <div className="demo-header">
                <h2>Waypoint Demo</h2>
                <button onClick={onClose} className="close-button">
                    <FontAwesomeIcon icon={faTimes} />
                </button>
            </div>
            <div className="waypoint-card">
                <h3>{currentWaypoint.name}</h3>
                <p>{currentWaypoint.description}</p>
                {currentWaypoint.media_url && (
                    <img src={currentWaypoint.media_url} alt={currentWaypoint.name} />
                )}
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