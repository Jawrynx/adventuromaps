import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faChevronDown, faEllipsisV, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const shrewsburyCoordinates = [
    { "lat": 52.683122848662535, "lng": -2.7585323211824564 },
    { "lat": 52.68738930614514, "lng": -2.7561290619051126 },
    { "lat": 52.69039605463666, "lng": -2.7544298849165405 },
    { "lat": 52.6906041495221, "lng": -2.754966326719519 },
    { "lat": 52.69094230159571, "lng": -2.7552238187849487 },
    { "lat": 52.691306462438455, "lng": -2.7550521574079956 },
    { "lat": 52.69154056423347, "lng": -2.754644461637732 },
    { "lat": 52.69165761466031, "lng": -2.7541509351789917 },
    { "lat": 52.69160559228714, "lng": -2.7536788663923706 },
    { "lat": 52.69129345674636, "lng": -2.7533570013105835 },
    { "lat": 52.69099432475921, "lng": -2.7530780515730346 },
    { "lat": 52.69085126091043, "lng": -2.7512541494429077 },
    { "lat": 52.69050010220335, "lng": -2.749752112394568 },
    { "lat": 52.69042206655158, "lng": -2.7492371282637085 }
];

function Explore({ onSelectRoute }) {
  const [showMore, setShowMore] = useState(false);

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  const handleItemClick = (routeData) => {
    onSelectRoute(routeData);
  };

  return (
    <div id='explore'>
      <h1>Exploration</h1>
      <ul>
        <li className='explore-item' onClick={() => handleItemClick(shrewsburyCoordinates)}>
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
            <button className='demo-button' onClick={() => e.stopPropagation()}><FontAwesomeIcon icon={faPlay} /></button>
            <button className='options-button' onClick={() => e.stopPropagation()}><FontAwesomeIcon icon={faEllipsisV} /></button>
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