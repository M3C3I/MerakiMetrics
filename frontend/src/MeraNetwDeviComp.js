import React, { useState, useEffect } from 'react';
import { fetchMeraNetwDevi } from './apiService';

function MeraMtComp({ meraNetwId, onDeviSelect }) 
{
    const [models, setModels] = useState({});
    const [selectedModel, setSelectedModel] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => 
    {
        if (!meraNetwId) 
        {
            setLoading(false);
            return;
        }
        fetchMeraNetwDevi(meraNetwId)
            .then(data => 
            {
                const newModels = data.reduce((acc, device) => 
                {
                    const { model, ...deviceDetails } = device;
                    if (!acc[model]) acc[model] = [];
                    acc[model].push(deviceDetails);
                    return acc;
                }, {});
                setModels(newModels);
                setLoading(false);
            })
            .catch(err => 
            {
                setError('Failed to fetch network devices');
                setLoading(false);
            });
    }, [meraNetwId]);

    if (!meraNetwId) return <div>Please select a network first.</div>;
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <label htmlFor="modelSelect">Select a Model:</label>
            <select id="modelSelect" value={selectedModel} onChange=
            {e => 
                {
                    setSelectedModel(e.target.value);
                    onDeviSelect(e.target.value, models[e.target.value] || []);
                }
            }defaultValue="">
            <option value="">Select a Model</option>
            {Object.keys(models).map(model => <option key={model} value={model}>{model}</option>)}
        </select>
    </div>
    );
}

export default MeraMtComp;