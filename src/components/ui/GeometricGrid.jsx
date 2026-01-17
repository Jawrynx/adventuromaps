import React from 'react'

function GeometricGrid() {
  return (
    <div className="geometric-grid">
      <div className="grid-pattern"></div>
    </div>
  )
}

export default GeometricGrid;

const containerStyles = {
    geometricGrid: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        zIndex: 1
    },
    gridPattern: {
        width: '120%',
        height: '120%',
        backgroundImage: `
            linear-gradient(90deg, rgba(255, 251, 0, 1) 2px, 2px),
            linear-gradient(rgba(255, 255, 255, 1) 2px, 2px)
        `,
        backgroundSize: '40px 40px',
        animation: 'gridMove 10s linear infinite'
    },
}