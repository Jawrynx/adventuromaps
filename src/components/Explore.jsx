import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faChevronDown, faEllipsisV, faChevronUp } from '@fortawesome/free-solid-svg-icons';

function Explore() {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  return (
    <div id='explore'>
      <h1>Exploration</h1>
      <ul>
        <li className='explore-item'>
          <img src="/assets/mountain.jpg" alt="#" width='100%' height='100px' className='explore-image' />
          <h2>Shrewsbury</h2>
          <p>Explore Shrewsbury's history and geography dating back to the Medieval Age. Discover & learn about its geography, medieval history and figures such as Charles Darwin. Prepare to embark on a historic journey!</p>
          <div className={`explore-more-container ${showMore ? 'expanded' : ''}`}>
            <div className="explore-more">
              <div className="route-info">
                <h3>Route Summary</h3>
                <p>This route takes you through the historic town of Shrewsbury, exploring its medieval architecture, significant landmarks, and picturesque streets. You'll visit key sites such as Shrewsbury Castle, St. Mary's Church, and the charming Market Square.</p>
                <div className="route-locations">
                  <h3>Key Locations</h3>
                  <ul>
                    <li>Shrewsbury Castle</li>
                    <li>St. Mary's Church</li>
                    <li>Market Square</li>
                  </ul>
                </div>
                <h3>Estimated Time</h3>
                <p>Approximately 2-3 hours, depending on your pace and the time spent at each location.</p>
                <h3>Difficulty Level</h3>
                <p>Easy to Moderate - Suitable for most fitness levels. Comfortable walking shoes recommended.</p>
              </div>
              <div className="route-topics">
                <h3>Topics Covered</h3>
                <ul>
                  <li>Medieval History</li>
                  <li>Architecture</li>
                  <li>Notable Figures (e.g., Charles Darwin)</li>
                  <li>Geography of Shrewsbury</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="explore-buttons">
            <button className='more-button' onClick={toggleShowMore}>
              <FontAwesomeIcon icon={showMore ? faChevronUp : faChevronDown} />
            </button>
            <button className='demo-button'><FontAwesomeIcon icon={faPlay} /></button>
            <button className='options-button'><FontAwesomeIcon icon={faEllipsisV} /></button>
          </div>
        </li>
        <li className='explore-item'>
          <img src="/assets/mountain.jpg" alt="#" width='100%' height='100px' className='explore-image' />
          <h2>Exploration Title</h2>
          <p>Exploration Description</p>
        </li>
        <li className='explore-item'>
          <img src="/assets/mountain.jpg" alt="#" width='100%' height='100px' className='explore-image' />
          <h2>Exploration Title</h2>
          <p>Exploration Description</p>
        </li>
        <li className='explore-item'>
          <img src="/assets/mountain.jpg" alt="#" width='100%' height='100px' className='explore-image' />
          <h2>Exploration Title</h2>
          <p>Exploration Description</p>
        </li>
      </ul>
    </div>
  );
}

export default Explore;