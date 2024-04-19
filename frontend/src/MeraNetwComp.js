import React, { useState, useEffect } from 'react';
import { fetchMeraOrgaNetw } from './apiService';

function MeraNetwComp({ meraOrgaId, onNetwSelect }) {
    const [meraNetw, setMeraNetw] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!meraOrgaId) {
            setLoading(false);
            return;
        }
        fetchMeraOrgaNetw(meraOrgaId)
            .then(data => {
                setMeraNetw(data);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to fetch networks');
                setLoading(false);
            });
    }, [meraOrgaId]);

    if (!meraOrgaId) return <div>Please select an organization first.</div>;
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <label htmlFor="netSelect">Select a Network:</label>
            <select id="netSelect" onChange={e => onNetwSelect(e.target.value)} defaultValue="">
                <option value="">Select a Network</option>
                {meraNetw.map(net => <option key={net.id} value={net.id}>{net.name}</option>)}
            </select>
        </div>
    );
}

export default MeraNetwComp;