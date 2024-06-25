import {useState, useEffect} from 'react';
import {fetchMeraOrgaNetw} from './apiService';

// Component to select a network from a dropdown list based on the selected organization.
function MeraNetwComp({orgId, onNetwSelect}) {
  // State to hold the list of networks
  const [meraNetw, setMeraNetw] = useState([]);
  // State to control the loading indicator
  const [loading, setLoading] = useState(true);
  // State to hold error information
  const [error, setError] = useState(null);

  // Effect to fetch networks based on the organization ID
  useEffect(() => {
    setLoading(true);
    if (!orgId) {
      setLoading(false);
      return;
    }
    fetchMeraOrgaNetw(orgId)
      .then(data => {
        setMeraNetw(data); // Set the networks data
        setLoading(false); // Disable loading after data is fetched
      })
      .catch(() => {
        setError('Failed to fetch networks'); // Set error message on failure
        setLoading(false); // Disable loading even on error
      });
  }, [orgId]);

  // Display a prompt if no organization is selected
  if (!orgId) return <div>Please select an organization first.</div>;
  // Show loading message during data fetch
  if (loading)
    return (
      <div>
        <br />
        Loading...
      </div>
    );
  // Show error message if an error occurred during data fetch
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
      <label htmlFor="netSelect">Select a Network:</label>
      <br />
      <select
        id="netSelect"
        onChange={e => onNetwSelect(e.target.value)}
        defaultValue="">
        <option value="">Select a Network</option>
        {meraNetw.map(net => (
          <option key={net.id} value={net.id}>
            {net.name}
          </option>
        ))}
      </select>
      <br />
    </div>
  );
}

export default MeraNetwComp;
