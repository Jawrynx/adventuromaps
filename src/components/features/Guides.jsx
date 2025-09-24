import React, { useState } from 'react';
import GuidesBar from '../ui/GuidesBar';
import PostsList from '../ui/PostsList';
import './css/Guides.css';

function Guides() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div id='guides'>
      <GuidesBar onCategorySelect={handleCategorySelect} />
      <div className="guides-content">
        {selectedCategory ? (
          <PostsList category={selectedCategory} />
        ) : (
          <div className="select-category">
            <h2>Welcome to Guides & Safety</h2>
            <p>Select a category from the sidebar to view available guides</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Guides;