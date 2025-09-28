/**
 * Guides.jsx - Educational content and safety information interface
 * 
 * This component provides access to educational guides and safety information
 * organized by categories. It serves as the main interface for browsing
 * instructional content, safety protocols, and user guides for the application.
 */

import React, { useState } from 'react';
import GuidesBar from '../ui/GuidesBar';
import PostsList from '../ui/PostsList';
import './css/Guides.css';

/**
 * Guides Component
 * 
 * Main interface for accessing educational and safety content:
 * - Displays category navigation sidebar
 * - Shows filtered content based on selected category
 * - Provides welcome message when no category is selected
 * - Manages state for category-based content filtering
 * 
 * @returns {JSX.Element} Guides interface with category navigation and content display
 */
function Guides() {
  // ========== COMPONENT STATE ==========
  const [selectedCategory, setSelectedCategory] = useState(null); // Currently selected guide category

  /**
   * Handles category selection from the navigation sidebar
   * 
   * Updates the selected category state to filter and display
   * relevant guides and posts for the chosen category.
   * 
   * @param {string} category - The selected category name
   */
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