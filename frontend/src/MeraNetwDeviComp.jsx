import React, { useState, useEffect } from 'react';
import { fetchMeraNetwDevi } from './apiService';

// Component to fetch and display network devices based on the selected network ID.
function MeraNetwDeviComp({ netId, setDevices }) {
  // State to control the loading indicator
  const [loading, setLoading] = useState(true);
  // State to hold error information
  const [error, setError] = useState(null);
  // Effect to fetch devices when netId changes
  useEffect(() => {
    setLoading(true);
    if (!netId) {
      setLoading(false); // Disable loading if no network is selected
      return;
    }
    fetchMeraNetwDevi(netId)
      .then(data => {
        // Filter devices by specific model
        const filteredDevices = data.filter(
          device =>
            device.model === 'MT14' ||
            device.model === 'MT15' ||
            device.model === 'MT10',
        );
        // Update state with the filtered devices
        setDevices(filteredDevices);
        // Disable loading after handling data
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch network devices'); // Set error message on failure
        setLoading(false); // Disable loading even on error
      });
  }, [netId, setDevices]); // Depend on netId and setDevices to re-run effect

  if (!netId)
    return (
      <div>
        <br />
        Please select a network first.
        <br />
      </div>
    );
  if (loading)
    return (
      <div>
        <br />
        Loading...
      </div>
    );
  if (error)
    return (
      <div>
        <br />
        Error: {error}
      </div>
    );
  return (
    <div>
      <br />
      {setDevices.length > 0 ? '' : 'No MT14 or MT15 devices found.'}
    </div>
  );
}

export default MeraNetwDeviComp;
