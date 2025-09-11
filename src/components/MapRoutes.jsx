import React from 'react';
import { Polyline } from './Polyline';

function MapRoutes({ routes }) {
    return (
        <>
            {routes.map((route) => (
                <Polyline
                    key={route.id}
                    path={route.path}
                    strokeColor="#FF0000"
                    strokeOpacity={0.8}
                    strokeWeight={4}
                />
            ))}
        </>
    );
}

export default MapRoutes;