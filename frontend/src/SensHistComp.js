import React, { useState } from 'react';
import { fetchSensHist } from './apiService';

function SensHistComp() {
    const [orgId, setOrgId] = useState('');
    const [sensHist, setSensHist] = useState([]);

    const handleFetch = () => {
        fetchSensHist(orgId).then(setSensHist).catch(console.error);
    };

    return (
        <div>
            <h1>Sensor History</h1>
            <input type="text" placeholder="Enter Organization ID" value={orgId} onChange={e => setOrgId(e.target.value)} />
            <button onClick={handleFetch}>Load Sensor History</button>
            <pre>{JSON.stringify(sensHist, null, 2)}</pre>
        </div>
    );
}

export default SensHistComp;
