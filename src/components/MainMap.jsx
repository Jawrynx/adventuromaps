import React from 'react'
import { Map } from '@vis.gl/react-google-maps';

function MainMap() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
        <Map
            defaultZoom={3}
            defaultCenter={ { lat: 30, lng: 0 } }>
        </Map>
    </div>
  )
}

export default MainMap