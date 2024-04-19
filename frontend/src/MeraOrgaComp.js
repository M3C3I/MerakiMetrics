import React, { useState, useEffect } from 'react';
import { fetchMeraOrga } from './apiService';

function MeraOrgaComp({ onOrgaSelect }) {
    const [meraOrga, setMeraOrga] = useState([]);
    const [selectedOrgaId, setSelectedOrgaId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true)
        fetchMeraOrga()
            .then(data => {
                if (data.length > 0)
                {
                    setMeraOrga(data);
                    setSelectedOrgaId(data[0].id);
                    onOrgaSelect(data[0].id);
                }
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to fetch organizations'+err);
                setLoading(false);
            });
    }, [onOrgaSelect]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <label htmlFor="orgSelect">Select an Organization:</label>
            <select id="orgSelect" value={selectedOrgaId} onChange={e => {
                setSelectedOrgaId(e.target.value);
                onOrgaSelect(e.target.value);
            }} aria-label="Select Organization">
                {meraOrga.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
            </select>
        </div>
    );
}

export default MeraOrgaComp;