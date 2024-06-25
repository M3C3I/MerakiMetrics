import axios from 'axios';

// Base URL for all API requests.
// const API_BASE_URL = 'https://monitor.usuiusa.com:3301';
const API_BASE_URL = 'http://192.168.64.64:3301';

// Fetches a list of organizations from the API.
export const fetchMeraOrga = async () => {
  const response = await axios.get(`${API_BASE_URL}/meraki/organizations`);
  return response.data;
};

// Fetches networks for a specific organization using its ID.
export const fetchMeraOrgaNetw = async orgId => {
  const response = await axios.get(
    `${API_BASE_URL}/meraki/organizations/${orgId}/networks`,
  );
  return response.data;
};

// Fetches devices for a specific network using its ID.
export const fetchMeraNetwDevi = async netId => {
  const response = await axios.get(
    `${API_BASE_URL}/meraki/networks/${netId}/devices`,
  );
  return response.data;
};
export const fetchAllMetricsForDevices = async (
  orgId,
  interval,
  timespan,
  devices,
  metrics,
) => {
  let allData = [];
  for (const device of devices) {
    let deviceData = {
      deviceSerial: device.serial,
      deviceName: device.name,
      data: [],
    };
    for (const metric of metrics) {
      const params = new URLSearchParams({
        interval: interval,
        timespan: timespan,
        'serials[]': device.serial,
        'metrics[]': metric,
      });
      try {
        const response = await axios.get(
          `${API_BASE_URL}/meraki/organizations/${orgId}/sensor/readings/history/byInterval`,
          {params},
        );
        deviceData.data.push({metric: metric, values: response.data});
      } catch (error) {
        console.error(
          `Failed to fetch data for serial ${device.serial} and metric ${metric}:`,
          error,
        );
      }
    }
    allData.push(deviceData);
  }
  return allData;
};
// export const fetchAllMetricsForDevices = async (
//   orgId,
//   interval,
//   timespan,
//   devices,
//   metrics,
// ) => {
//   let allData = [];
//   for (const device of devices) {
//     let deviceData = {
//       deviceSerial: device.serial,
//       deviceName: device.name,
//       data: [],
//     };
//     for (const metric of metrics) {
//       const params = new URLSearchParams({
//         interval: interval,
//         timespan: timespan,
//         'serials[]': device.serial,
//         'metrics[]': metric,
//       });
//       try {
//         const response = await axios.get(
//           `${API_BASE_URL}/meraki/organizations/${orgId}/sensor/readings/history/byInterval`,
//           {
//             params: params,
//           },
//         );
//         deviceData.data.push({metric: metric, values: response.data});
//       } catch (error) {
//         console.error(
//           `Failed to fetch data for serial ${device.serial} and metric ${metric}:`,
//           error,
//         );
//       }
//     }
//     allData.push(deviceData);
//   }
//   return allData;
// };
