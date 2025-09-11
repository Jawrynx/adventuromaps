import React, { useEffect, useState } from 'react';
import { Map, APIProvider, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import Modal from './Modal';
import AdmTools from './AdmTools';

// CSS

import '../components/css/Admin.css';


function DrawingTool({ onPolylineComplete }) {
  const map = useMap();
  const drawingLibrary = useMapsLibrary('drawing');
  const [drawingManager, setDrawingManager] = useState(null);

  useEffect(() => {
    if (!drawingLibrary || !map) return;

    // Create the drawing manager instance
    const manager = new drawingLibrary.DrawingManager({
      drawingMode: drawingLibrary.OverlayType.POLYLINE,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          drawingLibrary.OverlayType.POLYLINE,
        ],
      },
      polylineOptions: {
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        clickable: true,
        editable: true,
      },
    });

    manager.setMap(map);

    window.google.maps.event.addListener(manager, 'overlaycomplete', (event) => {
      if (event.type === window.google.maps.drawing.OverlayType.POLYLINE) {
        const path = event.overlay.getPath().getArray().map(latLng => ({
          lat: latLng.lat(),
          lng: latLng.lng(),
        }));
        onPolylineComplete(path);
      }
    });

    setDrawingManager(manager);

    return () => {
      if (drawingManager) {
        drawingManager.setMap(null);
      }
    };
  }, [drawingLibrary, map]);

  return null;
}

function Admin() {
  const [savedRoutes, setSavedRoutes] = useState([]);

  const handlePolylineComplete = (path) => {
    console.log('New polyline coordinates:', path);
    alert('Polyline drawn! Check the console for coordinates.');
    
    setSavedRoutes([...savedRoutes, path]);
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <APIProvider apiKey="YOUR_API_KEY_HERE">
        <Map
          defaultZoom={12}
          defaultCenter={{ lat: 52.7061, lng: -2.7533 }}
        >
          <DrawingTool onPolylineComplete={handlePolylineComplete} />
        </Map>
      </APIProvider>
      <Modal>
        <AdmTools />
      </Modal>
    </div>
  );
}

export default Admin;