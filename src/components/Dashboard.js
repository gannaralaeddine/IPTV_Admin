import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => (
    <div>
        <h1>IPTV Admin Dashboard</h1>
        <ul className="list-group">
            <li className="list-group-item"><Link to="/live-categories">Manage Live Categories</Link></li>
            <li className="list-group-item"><Link to="/live-streams">Manage Live Streams</Link></li>
            <li className="list-group-item"><Link to="/vod-categories">Manage VOD Categories</Link></li>
            <li className="list-group-item"><Link to="/vod-streams">Manage VOD Streams</Link></li>
            <li className="list-group-item"><Link to="/series-categories">Manage Series Categories</Link></li>
            <li className="list-group-item"><Link to="/series-streams">Manage Series Streams</Link></li>
            <li className="list-group-item"><Link to="/seasons">Manage Seasons</Link></li>
            <li className="list-group-item"><Link to="/episodes">Manage Episodes</Link></li>
        </ul>
    </div>
);

export default Dashboard;
