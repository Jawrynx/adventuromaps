import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faChevronDown, faEllipsisV, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";

function Adventure({ onSelectRoute }) {
  const [showMore, setShowMore] = useState({});
  const [adventures, setAdventures] = useState([]);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const getAdventures = async () => {
      try {
        const adventuresCollection = collection(db, "adventure");
        const q = query(adventuresCollection, where("status", "==", "published"));
        const querySnapshot = await getDocs(q);
        
        const fetchedAdventures = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAdventures(fetchedAdventures);
        console.log("Fetched published adventures:", fetchedAdventures);
      } catch (error) {
        console.error("Error fetching adventures:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getAdventures();
  }, []);

  const toggleShowMore = (itemId) => {
    setShowMore(prevShowMore => ({
      ...prevShowMore,
      [itemId]: !prevShowMore[itemId]
    }));
  };

  const handleItemClick = async (adventureData) => {
    console.log("Selected adventure:", adventureData);
    
    try {
      const routesCollectionRef = collection(db, "adventure", adventureData.id, "routes");
      
      const q = query(routesCollectionRef, orderBy("order"));
      const routesSnapshot = await getDocs(q);
      
      const fetchedRoutes = routesSnapshot.docs.map(doc => doc.data().coordinates);
      
      const flattenedCoordinates = fetchedRoutes.flat();
      
      onSelectRoute(flattenedCoordinates);
      
      console.log("Route coordinates sent to parent:", flattenedCoordinates);
    } catch (error) {
      console.error("Error fetching route subcollection:", error);
      alert("Error loading route data. Please check the console for details.");
    }
  };

  if (loading) {
    return (
      <div id='adventure'>
        <p>Loading adventures...</p>
      </div>
    );
  }
  
  if (adventures.length === 0) {
    return (
      <div id='adventure'>
        <h1>Adventure</h1>
        <p>No published adventures found.</p>
      </div>
    );
  }

  return (
    <div id='adventure'>
      <h1>Adventure</h1>
      <ul>
        {adventures.map(item => (
          <li key={item.id} className='adventure-item' onClick={() => handleItemClick(item)}>
            <img src={item.image_url} alt={item.name} width='100%' height='100px' className='adventure-image' />
            <h2>{item.name}</h2>
            <p>{item.description}</p>
            <div className={`adventure-more-container ${showMore[item.id] ? 'expanded' : ''}`}>
              <div className="adventure-more">
                <div className="route-info">
                  <h3>Route Summary</h3>
                  <p>{item.subDescription}</p>
                  {item.keyLocations && (
                    <div className="route-locations">
                      <h3>Key Locations</h3>
                      <ul>
                        {item.keyLocations.map((location, index) => (
                          <li key={index}>{location}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {item.estimatedTime && (
                    <>
                      <h3>Estimated Time</h3>
                      <p>{item.estimatedTime}</p>
                    </>
                  )}
                  {item.difficulty && (
                    <>
                      <h3>Difficulty Level</h3>
                      <p>{item.difficulty}</p>
                    </>
                  )}
                </div>
                {item.categories && (
                  <div className="route-topics">
                    <h3>Topics Covered</h3>
                    <ul>
                      {item.categories.map((category, index) => (
                        <li key={index}>{category}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="adventure-buttons">
              <button className='more-button' onClick={(e) => { e.stopPropagation(); toggleShowMore(item.id); }}>
                <FontAwesomeIcon icon={showMore[item.id] ? faChevronUp : faChevronDown} />
              </button>
              <button className='demo-button' onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}>
                <FontAwesomeIcon icon={faPlay} />
              </button>
              <button className='options-button' onClick={(e) => { e.stopPropagation(); }}><FontAwesomeIcon icon={faEllipsisV} /></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Adventure;