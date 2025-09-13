import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
import WaypointEditor from './WaypointEditor';

function AdmTools({ routes, onRemoveRoute, onUpdateWaypointName }) {
    const [editingWaypoint, setEditingWaypoint] = useState(null);

    const handleEditClick = (route, waypointIndex) => {
        setEditingWaypoint({
            routeId: route.id,
            waypointIndex: waypointIndex,
            waypoint: route.waypoints[waypointIndex]
        });
    };

    const handleCloseEditor = () => {
        setEditingWaypoint(null);
    };

    return (
        <div id='admin'>
            <button id='minimize-button' onClick={() => {
                document.getElementById('modal').classList.toggle('minimized');
            }}>_</button>
            <h2>Admin Tools</h2>

            {editingWaypoint ? (
                <WaypointEditor
                    waypointData={editingWaypoint}
                    onClose={handleCloseEditor}
                />
            ) : (
                <>
                    <div className="waypoints-list">
                        <h3>Waypoints</h3>
                        <table className="waypoints-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Lat.</th>
                                    <th>Long.</th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {routes.map((route, index) => (
                                    <React.Fragment key={route.id}>
                                        <tr className='route-start-row'>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="waypoint-name-start"
                                                    value={route.waypoints[0].name}
                                                    onChange={(e) => onUpdateWaypointName(route.id, 0, e.target.value)}
                                                />
                                            </td>
                                            <td>{route.waypoints[0].lat.toFixed(6)}</td>
                                            <td>{route.waypoints[0].lng.toFixed(6)}</td>
                                            <td rowSpan="1">
                                                <button
                                                    className='warning-button red'
                                                    onClick={() => onRemoveRoute(route.id)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </td>
                                            <td rowSpan="1">
                                                <button
                                                    className='info-button blue'
                                                    onClick={() => handleEditClick(route, 0)}
                                                >
                                                    <FontAwesomeIcon icon={faPencil} />
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <input
                                                    type="text"
                                                    name="waypoint-name-end"
                                                    value={route.waypoints[1].name}
                                                    onChange={(e) => onUpdateWaypointName(route.id, 1, e.target.value)}
                                                />
                                            </td>
                                            <td>{route.waypoints[1].lat.toFixed(6)}</td>
                                            <td>{route.waypoints[1].lng.toFixed(6)}</td>
                                            <td rowSpan="1">
                                                <button
                                                    className='warning-button red'
                                                    onClick={() => onRemoveRoute(route.id)}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </td>
                                            <td rowSpan="1">
                                                <button
                                                    className='info-button blue'
                                                    onClick={() => handleEditClick(route, 1)}
                                                >
                                                    <FontAwesomeIcon icon={faPencil} />
                                                </button>
                                            </td>
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
                </>
            )}
        </div>
    );
}

export default AdmTools;