import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function AdmTools({ waypoints, onRemoveWaypoint }) {
    return (
        <div id='admin'>
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
                        {waypoints.map((wp) => (
                            <tr key={wp.id}>
                                <td><input type="text" name="waypoint-name" id="waypoint-name" placeholder={wp.name} onChange={(e) => wp.name = e.target.value}/></td>
                                <td>{wp.lat.toFixed(6)}</td>
                                <td>{wp.lng.toFixed(6)}</td>
                                <td>
                                    <button 
                                        className='warning-button red' 
                                        onClick={() => onRemoveWaypoint(wp.id)}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </td>
                            </tr>
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