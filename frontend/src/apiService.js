import axios from 'axios';

const API_BASE_URL = 'http://192.168.65.235:3301';

export const fetchMeraOrga = async () => {
    const response = await axios.get(`${API_BASE_URL}/meraki/organizations`);
    return response.data;
};

export const fetchMeraOrgaNetw = async (orgId) => {
    const response = await axios.get(`${API_BASE_URL}/meraki/organizations/${orgId}/networks`);
    return response.data;
};

export const fetchMeraNetwDevi = async (netId) => {
    const response = await axios.get(`${API_BASE_URL}/meraki/networks/${netId}/devices`);
    return response.data;
};

export const fetchMeraNetwSensHist = async (orgId, timespan, serials, metric) => {
    const params = new URLSearchParams();

    params.append('timespan', timespan);
    params.append('metrics[]', metric);
    serials.forEach(serial => params.append('serials[]', serial));

    const response = await axios.get(`${API_BASE_URL}/meraki/organizations/${orgId}/sensors/history`, {
        params: params
    });

    return response.data;
};