// AdmTools.jsx

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function AdmTools({ routes, onRemoveRoute }) {
    return (
        <div id='admin'>
            <button id='minimize-button' onClick={() => {
                document.getElementById('modal').classList.toggle('minimized');
            }}>_</button>
            <h2>Admin Tools</h2>
            <div className="waypoints-list">
                <h3>Waypoints</h3>
                <table className="waypoints-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Lat.</th>
                            <th>Long.</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {routes.map((route) => (
                            <React.Fragment key={route.id}>
                                <tr>
                                    <td><input type="text" name="waypoint-name" id="waypoint-name-start" placeholder={route.waypoints[0].name} onChange={(e) => route.waypoints[0].name = e.target.value} /></td>
                                    <td>{route.waypoints[0].lat.toFixed(6)}</td>
                                    <td>{route.waypoints[0].lng.toFixed(6)}</td>
                                    <td rowSpan="2">
                                        <button 
                                            className='warning-button red' 
                                            onClick={() => onRemoveRoute(route.id)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                                <tr>
                                    <td><input type="text" name="waypoint-name" id="waypoint-name-end" placeholder={route.waypoints[1].name} onChange={(e) => route.waypoints[1].name = e.target.value} /></td>
                                    <td>{route.waypoints[1].lat.toFixed(6)}</td>
                                    <td>{route.waypoints[1].lng.toFixed(6)}</td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="tools-container">
                <button className="adm-button green">Save Route</button>
                <button className="adm-button red">Clear Route</button>
                <button className="adm-button green">Export Route</button>
                <button className="adm-button blue">Import Route</button>
            </div>
        </div>
    );
}

export default AdmTools;