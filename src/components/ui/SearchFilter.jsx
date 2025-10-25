/**
 * SearchFilter.jsx - Reusable search and filter component
 * 
 * Provides search functionality and multi-criteria filtering for adventure/exploration items.
 * Features include:
 * - Text search across item names and descriptions
 * - Location-based filtering
 * - Difficulty level filtering (Easy, Medium, Hard)
 * - Transport type filtering (Walking, Cycling, Driving, etc.)
 * - Responsive, colorful UI with toggle chips
 */

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter,
  faWalking,
  faBicycle,
  faCar,
  faTrain,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import './css/SearchFilter.css';

/**
 * SearchFilter Component
 * 
 * @param {Array} items - Array of items to filter (adventures or explorations)
 * @param {Function} onFilteredItems - Callback to pass filtered items back to parent
 * @param {string} placeholder - Search bar placeholder text
 * @returns {JSX.Element} Search and filter interface
 */
function SearchFilter({ items, onFilteredItems, placeholder = "Search..." }) {
  // ========== COMPONENT STATE ==========
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  
  // Available filter options (can be expanded based on your data)
  const difficulties = ['easy', 'medium', 'hard'];
  const transportTypes = [
    { id: 'walking', label: 'Walking', icon: faWalking },
    { id: 'cycling', label: 'Cycling', icon: faBicycle },
    { id: 'driving', label: 'Driving', icon: faCar },
    { id: 'public-transport', label: 'Public Transport', icon: faTrain }
  ];
  
  // Extract unique locations from items
  const [availableLocations, setAvailableLocations] = useState([]);

  /**
   * Extract unique locations from all items on component mount or when items change
   */
  useEffect(() => {
    const locations = new Set();
    items.forEach(item => {
      if (item.keyLocations && Array.isArray(item.keyLocations)) {
        item.keyLocations.forEach(loc => locations.add(loc));
      }
    });
    setAvailableLocations([...locations].sort());
  }, [items]);

  /**
   * Apply all filters whenever search term or filter selections change
   */
  useEffect(() => {
    let filtered = [...items];

    // Text search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.subDescription?.toLowerCase().includes(searchLower) ||
        item.categories?.some(cat => cat.toLowerCase().includes(searchLower))
      );
    }

    // Difficulty filter
    if (selectedDifficulties.length > 0) {
      filtered = filtered.filter(item => 
        selectedDifficulties.includes(item.difficulty)
      );
    }

    // Transport type filter
    if (selectedTransport.length > 0) {
      filtered = filtered.filter(item => 
        item.transportType && selectedTransport.includes(item.transportType)
      );
    }

    // Location filter
    if (selectedLocations.length > 0) {
      filtered = filtered.filter(item => 
        item.keyLocations && 
        item.keyLocations.some(loc => selectedLocations.includes(loc))
      );
    }

    onFilteredItems(filtered);
  }, [searchTerm, selectedDifficulties, selectedTransport, selectedLocations, items]);

  /**
   * Toggle difficulty filter selection
   */
  const toggleDifficulty = (difficulty) => {
    setSelectedDifficulties(prev => 
      prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  /**
   * Toggle transport type filter selection
   */
  const toggleTransport = (transport) => {
    setSelectedTransport(prev => 
      prev.includes(transport) 
        ? prev.filter(t => t !== transport)
        : [...prev, transport]
    );
  };

  /**
   * Toggle location filter selection
   */
  const toggleLocation = (location) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  /**
   * Clear all filters and search
   */
  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedDifficulties([]);
    setSelectedTransport([]);
    setSelectedLocations([]);
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = searchTerm || 
    selectedDifficulties.length > 0 || 
    selectedTransport.length > 0 || 
    selectedLocations.length > 0;

  return (
    <div className="search-filter">
      {/* Search Bar Row */}
      <div className="search-bar-row">
        <div className="search-input-wrapper">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
        
        <button 
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          aria-label="Toggle filters"
        >
          <FontAwesomeIcon icon={faFilter} />
          {hasActiveFilters && <span className="filter-badge">{
            selectedDifficulties.length + 
            selectedTransport.length + 
            selectedLocations.length +
            (searchTerm ? 1 : 0)
          }</span>}
        </button>

        {hasActiveFilters && (
          <button 
            className="clear-all-btn"
            onClick={clearAllFilters}
            aria-label="Clear all filters"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="filters-section">
          {/* Difficulty Filters */}
          <div className="filter-group">
            <h3 className="filter-group-title">Difficulty</h3>
            <div className="filter-chips">
              {difficulties.map(difficulty => (
                <button
                  key={difficulty}
                  className={`filter-chip difficulty-${difficulty} ${
                    selectedDifficulties.includes(difficulty) ? 'active' : ''
                  }`}
                  onClick={() => toggleDifficulty(difficulty)}
                >
                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Transport Type Filters */}
          <div className="filter-group">
            <h3 className="filter-group-title">Transport</h3>
            <div className="filter-chips">
              {transportTypes.map(transport => (
                <button
                  key={transport.id}
                  className={`filter-chip transport-chip ${
                    selectedTransport.includes(transport.id) ? 'active' : ''
                  }`}
                  onClick={() => toggleTransport(transport.id)}
                >
                  <FontAwesomeIcon icon={transport.icon} />
                  <span>{transport.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location Filters */}
          {availableLocations.length > 0 && (
            <div className="filter-group location-filter-group">
              <h3 className="filter-group-title">Locations</h3>
              <div className="filter-chips location-chips">
                {availableLocations.slice(0, 10).map(location => (
                  <button
                    key={location}
                    className={`filter-chip location-chip ${
                      selectedLocations.includes(location) ? 'active' : ''
                    }`}
                    onClick={() => toggleLocation(location)}
                  >
                    {location}
                  </button>
                ))}
                {availableLocations.length > 10 && (
                  <span className="more-locations-hint">
                    +{availableLocations.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchFilter;
