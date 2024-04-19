const path = require('path');
const express = require('express');
const axios = require('axios');
const dotenvPath = path.join(__dirname, '..', '.env');

require('dotenv').config({ path: dotenvPath });
console.log('dotenvPath = ' + dotenvPath);
console.log('MERAKI_BASE_URL = ' + process.env.MERAKI_BASE_URL);

const merakiAPI = axios.create({
  baseURL: process.env.MERAKI_BASE_URL,
  headers: {
    'X-Cisco-Meraki-API-Key': process.env.MERAKI_API_KEY
  },
});

module.exports = (storage) => {
  const router = express.Router();

  function getCache(key) {
    const item = storage[key];
    if (item && (Date.now() < item.expiry)) {
      return item.value;
    }
    return null;
  }

  function setCache(key, value) {
    storage[key] = {
      value,
      expiry: Date.now()+600,
    };
  }

  router.get('/organizations', async (req, res) => {
    const cacheKey = 'merakiOrganizations';
    let cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log('Returning cached organizations data');
      req.apiData = cachedData;
      return res.json(cachedData);
    }

    try {
      const response = await merakiAPI.get('/organizations');
      console.log('Fetching new organizations data from API');
      cachedData = response.data;
      setCache(cacheKey, cachedData);
      req.apiData = cachedData;
      res.json(cachedData);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching data from Meraki API. Please try again later.');
    }
  });

  router.get('/organizations/:orgId/networks', async (req, res) => {
    const { orgId } = req.params;
    const cacheKey = `merakiNetworks_${orgId}`;
    console.log('WTF.... cacheKey = '+cacheKey);
    let cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log('Returning cached networks data for Org ID:', orgId);
      req.apiData = cachedData;
      return res.json(cachedData);
    }

    try {
      const response = await merakiAPI.get(`/organizations/${orgId}/networks`);
      console.log('Fetching new networks data from API for Org ID:', orgId);
      cachedData = response.data;
      setCache(cacheKey, cachedData);
      req.apiData = cachedData;
      res.json(cachedData);
    } catch (error) {
      console.error('Error fetching networks data for Org ID:', orgId, error);
      res.status(500).send('Error fetching data from Meraki API. Please try again later.');
    }
  });

  router.get('/networks/:netId/devices', async (req, res) =>
  {
    const { netId } = req.params;
    const cacheKey = `merakiNetworkDevices_${netId}`;
    let cachedData = getCache(cacheKey);
    if (cachedData) {
      console.log('Returning cached devices data for Network ID:', netId);
      req.apiData = cachedData;
      return res.json(cachedData);
    }

    try {
      const response = await merakiAPI.get(`/networks/${netId}/devices`);
      console.log('Fetching new devices data from API for Network ID:', netId);
      cachedData = response.data;
      setCache(cacheKey, cachedData);
      req.apiData = cachedData;
      res.json(cachedData);
    } catch (error) {
      console.error('Error fetching devices data for Network ID:', netId, error);
      res.status(500).send('Error fetching data from Meraki API. Please try again later.');
    }
  });


  router.get('/organizations/:orgId/sensors/history', async (req, res) => {
    const { orgId } = req.params;
    const queryParams = req.query;
  
    console.log('Requested Org ID:', orgId);
    console.log('Query Params:', queryParams);
  
    const cacheKey = `sensorHistory_${orgId}_${JSON.stringify(queryParams)}`;
    let cachedData = getCache(cacheKey);
  
    if (cachedData) {
      console.log(`Returning cached sensor history for organization ${orgId} with parameters ${JSON.stringify(queryParams)}`);
      req.apiData = cachedData;
      return res.json(cachedData);
    }
  
    try {
      const response = await merakiAPI.get(`/organizations/${orgId}/sensor/readings/history`, { params: queryParams });
      console.log(`Fetching new sensor history for organization ${orgId} with parameters ${JSON.stringify(queryParams)} from API`);
      console.log(response.data);
      cachedData = response.data;
      setCache(cacheKey, cachedData);
      req.apiData = cachedData;
      res.json(cachedData);
    } catch (error) {
      console.error(error);
      res.status(500).send(`Error fetching sensor history for organization ${orgId} with parameters ${JSON.stringify(queryParams)} from Meraki API. Please try again later.`);
    }
  });
  
  return router;
};