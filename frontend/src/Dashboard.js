import React, { useState } from 'react';
import MeraOrgaComp from './MeraOrgaComp';
import MeraNetwComp from './MeraNetwComp';
import MeraNetwDeviComp from './MeraNetwDeviComp';
import MeraMtComp from './MeraMtComp';
import MeraMxComp from './MeraMxComp';
import MeraMsComp from './MeraMsComp';

function Dashboard() {
    const [selectedOrgId, setSelectedOrgId] = useState('');
    const [selectedNetwId, setSelectedNetwId] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [devices, setDevices] = useState([]);

    const handleDeviceSelect = (model, devices) => {
        setSelectedModel(model);
        setDevices(devices);
    };

    return (
        <div>
            <MeraOrgaComp onOrgaSelect={setSelectedOrgId}/>
            {selectedOrgId && 
                <MeraNetwComp meraOrgaId={selectedOrgId} onNetwSelect={setSelectedNetwId}/>
            }
            {selectedNetwId &&
                <MeraNetwDeviComp meraNetwId={selectedNetwId} onDeviSelect={handleDeviceSelect}/>
            }
            {devices.length > 0 && (
                selectedModel.startsWith('MT') ?
                <MeraMtComp devices={devices} orgId={selectedOrgId}/> :
                selectedModel.startsWith('MX') ?
                <MeraMxComp devices={devices} orgId={selectedOrgId}/> :
                selectedModel.startsWith('MS') ?
                <MeraMsComp devices={devices} orgId={selectedOrgId}/> :
                null
            )}
        </div>
    );
}

export default Dashboard;