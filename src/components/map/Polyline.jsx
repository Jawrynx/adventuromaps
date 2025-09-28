import { useEffect, useRef, useContext } from 'react';
import { GoogleMapsContext } from '@vis.gl/react-google-maps';

/**
 * Polyline Component
 * 
 * Custom React wrapper for Google Maps Polyline that provides route path
 * visualization on the map. Handles polyline lifecycle management including
 * creation, updates, and cleanup. Integrates with Google Maps context to
 * render connected line segments between coordinate points.
 * 
 * Features:
 * - Automatic polyline creation and map attachment
 * - Dynamic prop updates for styling and path changes
 * - Memory leak prevention through proper cleanup
 * - Integration with Google Maps React context
 * - Support for all Google Maps Polyline options
 * 
 * Common Props:
 * @param {Array} path - Array of {lat, lng} coordinate objects
 * @param {string} strokeColor - Polyline color (hex/rgb)
 * @param {number} strokeOpacity - Line transparency (0-1)
 * @param {number} strokeWeight - Line thickness in pixels
 * @param {boolean} clickable - Whether polyline responds to clicks
 * @param {boolean} editable - Whether polyline can be modified
 * @param {boolean} geodesic - Whether to follow Earth's curvature
 * 
 * @returns {null} Component renders directly to Google Maps, no JSX returned
 */
export const Polyline = (props) => {
  // Access Google Maps instance from React context
  const map = useContext(GoogleMapsContext)?.map;
  
  // Reference to store the Google Maps Polyline instance
  const polylineRef = useRef(null);

  /**
   * Initialize polyline when map becomes available
   * 
   * Creates a new Google Maps Polyline instance with provided props
   * and attaches it to the map. Sets up cleanup function to prevent
   * memory leaks when component unmounts.
   */
  useEffect(() => {
    if (!map) return; // Wait for map to be ready
    
    // Create new polyline with all provided props
    const polyline = new window.google.maps.Polyline(props);
    polyline.setMap(map);
    polylineRef.current = polyline;

    return () => {
      // Cleanup: Remove polyline from map when component unmounts
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [map]);

  /**
   * Update polyline properties when props change
   * 
   * Applies any changes to polyline styling, path, or behavior
   * without recreating the entire polyline instance. Ensures
   * visual updates are reflected immediately on the map.
   */
  useEffect(() => {
    if (polylineRef.current) {
      polylineRef.current.setOptions(props);
    }
  }, [props]);

  // Component renders directly to Google Maps, no JSX returned
  return null;
};