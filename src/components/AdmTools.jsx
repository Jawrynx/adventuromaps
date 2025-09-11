import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function AdmTools() {
  return (
    <div id='admin'>
        <h2>Admin Tools</h2>
        <div className="waypoints-list">
            <h3>Waypoints</h3>
            <table className="waypoints-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Latitude</th>
                        <th>Longitude</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Example waypoint rows */}
                    <tr>
                        <td>Waypoint 1</td>
                        <td>34.0522</td>
                        <td>-118.2437</td>
                        <td><button className='warning-button red'><FontAwesomeIcon icon={faTrash}/></button></td>
                    </tr>
                    <tr>
                        <td>Waypoint 2</td>
                        <td>36.1699</td>
                        <td>-115.1398</td>
                        <td><button className='warning-button red'><FontAwesomeIcon icon={faTrash}/></button></td>
                    </tr>
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
  )
}

export default AdmTools