import { useEffect, useRef, useContext } from 'react';
import { GoogleMapsContext } from '@vis.gl/react-google-maps';

export const Polyline = (props) => {
  const map = useContext(GoogleMapsContext)?.map;
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!map) return;
    const polyline = new window.google.maps.Polyline(props);
    polyline.setMap(map);
    polylineRef.current = polyline;

    return () => {
      // Clean up the polyline when the component is unmounted
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [map]);

  useEffect(() => {
    // Update polyline options when props change
    if (polylineRef.current) {
      polylineRef.current.setOptions(props);
    }
  }, [props]);

  return null;
};