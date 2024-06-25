import React, {useState, useEffect} from 'react';
import {fetchMeraOrga} from './apiService';

// Component to select an organization from a dropdown list, fetched from an API.
function MeraOrgaComp({onOrgaSelect}) {
  // State to hold the list of organizations
  const [meraOrga, setMeraOrga] = useState([]);
  // State to hold the selected organization ID~
  const [selectedOrgaId, setSelectedOrgaId] = useState('');
  // State to control the loading indicator
  const [loading, setLoading] = useState(true);
  // State to hold error information
  const [error, setError] = useState(null);

  // Effect to fetch organizations once and update the selected organization initially
  useEffect(() => {
    setLoading(true);
    fetchMeraOrga()
      .then(data => {
        if (data.length > 0) {
          setMeraOrga(data); // Set the organizations data
          setSelectedOrgaId(data[0].id); // Default select the first organization
          onOrgaSelect(data[0].id); // Propagate the default selection upwards
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch organizations' + err); // Set error message on failure
        setLoading(false);
      });
  }, [onOrgaSelect]);

  if (loading) return <div>Loading...</div>; // Show loading message during data fetch
  if (error) return <div>Error: {error}</div>; // Show error message if an error occurred during data fetch

  return (
    <div>
      <br />
      <label htmlFor="orgSelect">Select an Organization:</label>
      <br />
      <select
        id="orgSelect"
        value={selectedOrgaId}
        onChange={e => {
          setSelectedOrgaId(e.target.value);
          onOrgaSelect(e.target.value);
        }}
        aria-label="Select Organization">
        {meraOrga.map(org => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default MeraOrgaComp;
