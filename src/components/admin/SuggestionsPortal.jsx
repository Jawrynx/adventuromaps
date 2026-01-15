/**
 * SuggestionsPortal.jsx - Autocomplete suggestions dropdown component
 * 
 * A portal-rendered component that displays Google Places autocomplete suggestions
 * outside the DOM hierarchy to avoid z-index conflicts with modals and overlays.
 * 
 * Features:
 * - Portal rendering to document.body for proper layering
 * - Keyboard and mouse navigation support
 * - Structured suggestion display with primary and secondary text
 * - Customizable positioning and styling
 * - Accessibility-friendly interactions
 */

import React from 'react';
import ReactDOM from 'react-dom';
import './css/SuggestionsPortal.css';

/**
 * SuggestionsPortal Component
 * 
 * Renders autocomplete suggestions in a portal to avoid z-index issues.
 * Positioned absolutely based on the input field's coordinates.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isVisible - Whether the portal should be visible
 * @param {Array} props.suggestions - Array of Google Places suggestions
 * @param {Object} props.position - Position object with top, left, and width
 * @param {number} props.selectedIndex - Currently selected suggestion index
 * @param {Function} props.onSuggestionSelect - Callback when suggestion is selected
 * @param {Function} props.onSuggestionHover - Callback when suggestion is hovered
 * @returns {JSX.Element|null} Portal rendered suggestions or null
 */
const SuggestionsPortal = ({
    isVisible,
    suggestions,
    position,
    selectedIndex,
    onSuggestionSelect,
    onSuggestionHover
}) => {
    // Don't render if not visible or no suggestions
    if (!isVisible || !suggestions || suggestions.length === 0) {
        return null;
    }

    return ReactDOM.createPortal(
        <div 
            className="suggestions-portal"
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                width: `${position.width}px`,
            }}
        >
            {suggestions.map((suggestion, index) => {
                const mainText = suggestion.structured_formatting?.main_text || suggestion.description;
                const secondaryText = suggestion.structured_formatting?.secondary_text || '';
                
                return (
                    <div
                        key={suggestion.place_id}
                        className={`suggestion-item ${selectedIndex === index ? 'selected' : ''}`}
                        onMouseDown={() => onSuggestionSelect(suggestion.place_id, suggestion.description)}
                        onMouseEnter={() => onSuggestionHover(index)}
                    >
                        <div className="suggestion-main-text">
                            {mainText}
                        </div>
                        {secondaryText && (
                            <div className="suggestion-secondary-text">
                                {secondaryText}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>,
        document.body
    );
};

export default SuggestionsPortal;