import React from 'react'
import { Map } from '@vis.gl/react-google-maps';

function MainMap() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
        <Map
            defaultZoom={13}
            defaultCenter={ { lat: -33.860664, lng: 151.208138 } }>
        </Map>
    </div>
  )
}

export default MainMap