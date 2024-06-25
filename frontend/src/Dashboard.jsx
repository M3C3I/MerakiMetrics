// import React, {useState} from 'react';
// import MeraOrgaComp from './MeraOrgaComp.jsx';
// import MeraNetwComp from './MeraNetwComp.jsx';
// import MeraNetwDeviComp from './MeraNetwDeviComp.jsx';
// import MeraMtByIntComp from './MeraMtByIntComp.jsx';
// import styles from './Dashboard.module.css';

// // Dashboard component manages the state and interactions for an organization's network dashboard.
// function Dashboard() {
//   const [selectedOrgId, setSelectedOrgId] = useState('');
//   const [selectedNetwId, setSelectedNetwId] = useState('');
//   const [devices, setDevices] = useState([]);
//   return (
//     <div>
//       <h3 className={styles.h3dash}>UIC Plant Environment Monitor</h3>
//       <div className={styles.selection}>
//         <MeraOrgaComp onOrgaSelect={setSelectedOrgId} />
//         {selectedOrgId && (
//           <MeraNetwComp
//             orgId={selectedOrgId}
//             onNetwSelect={setSelectedNetwId}
//           />
//         )}
//         {selectedNetwId && (
//           <MeraNetwDeviComp netId={selectedNetwId} setDevices={setDevices} />
//         )}
//       </div>
//       {devices.length > 0 && (
//         <MeraMtByIntComp
//           devices={devices}
//           orgId={selectedOrgId}
//           netId={selectedNetwId}
//         />
//       )}
//     </div>
//   );
// }
// export default Dashboard;
import React, {useState} from 'react';
import { Line } from 'react-chartjs-2';
import MeraOrgaComp from './MeraOrgaComp.jsx';
import MeraNetwComp from './MeraNetwComp.jsx';
import MeraNetwDeviComp from './MeraNetwDeviComp.jsx';
import MeraMtByIntComp from './MeraMtByIntComp.jsx';
import styles from './Dashboard.module.css';

function Dashboard() {
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [selectedNetwId, setSelectedNetwId] = useState('');
  const [devices, setDevices] = useState([]);
  const [timeFrame, setTimeFrame] = useState(null); // Adding state for timeframe
  const timeOptions = [
    {label: 'Select a timeframe', value: null},
    {label: '1 Day', value: {timespan: 86400, interval: 120}},
    {label: '3 Days', value: {timespan: 259200, interval: 300}},
    {label: '7 Days', value: {timespan: 604800, interval: 900}},
    {label: '15 Days', value: {timespan: 1296000, interval: 3600}},
    {label: '30 Days', value: {timespan: 2592000, interval: 3600}},
  ];
  return (
    <div>
      <h3 className={styles.h3dash}>UIC Plant Environment Monitor</h3>
      <div className={styles.selection}>
        <MeraOrgaComp onOrgaSelect={setSelectedOrgId} />
        {selectedOrgId && (
          <MeraNetwComp
            orgId={selectedOrgId}
            onNetwSelect={setSelectedNetwId}
          />
        )}
        {selectedNetwId && (
          <MeraNetwDeviComp netId={selectedNetwId} setDevices={setDevices} />
        )}
        <select
          value={timeFrame ? JSON.stringify(timeFrame) : ''}
          onChange={e => setTimeFrame(JSON.parse(e.target.value))}
          disabled={!devices.length}>
          {timeOptions.map(option => (
            <option key={option.label} value={JSON.stringify(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {devices.length > 0 && timeFrame && (
        <MeraMtByIntComp
          orgId={selectedOrgId}
          timeFrame={timeFrame}
          devices={devices}
        />
      )}
    </div>
  );
}
export default Dashboard;
