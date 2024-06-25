/*
*
* FILE: /src/apis/meraki.js
* PURPOSE: API backend for Meraki with caching functionality and periodic refresh
* AUTHOR: M3C3I (github.com/M3C3I)
*
*/

const express = require('express');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const cron = require('node-cron');
const Bottleneck = require("bottleneck");
const dotenvPath = path.join(__dirname, '..', '.env');
require('dotenv').config({ path: dotenvPath });

const limiter = new Bottleneck
  ({maxConcurrent: 1,minTime: 100});

const merakiAPI = axios.create({
  baseURL: process.env.MERAKI_BASE_URL,
  headers: {'X-Cisco-Meraki-API-Key': process.env.MERAKI_API_KEY}
});

function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(`${key}[]`, item));
      } else {
          searchParams.append(key, value);
      }
  }
  return searchParams.toString();
}

module.exports = (storage) => {
  const router = express.Router();
  function getCache(key) {
    const item = storage[key];
    if (item && (Date.now() < item.expiry))
      {return item.value;}
    return null;
  }
  
  function setCache(key, value)
    {storage[key] = {value, expiry: Date.now() + 60000,};}

  async function fetchDataFromMeraki(apiPath, queryParams = {}) {
    const baseURL = process.env.MERAKI_BASE_URL;
    const queryString = buildQueryString(queryParams);
    if (baseURL.endsWith('/api/v1') && apiPath.startsWith('/api/v1'))
      {apiPath = apiPath.slice(7);}
    const fullUrl = `${baseURL}${apiPath}?${queryString}`; // Construct the full URL with correct query parameters
    let cachedData = getCache(fullUrl);
    if (cachedData) 
    {
      console.log('Returning cached data for:', fullUrl);
      return cachedData;
    }
    return limiter.schedule(() => makeApiRequest(apiPath, queryString, fullUrl));
  }
  
  async function makeApiRequest(apiPath, queryString, fullUrl) {
    try
    {
      const response = await merakiAPI.get(`${apiPath}?${queryString}`);
      console.log(`Fetching data from ${apiPath}`, `Data count: ${response.data.length}`);
      setCache(fullUrl, response.data);
      return response.data;
    }catch (error)
    {
      console.error(`Error fetching data from ${apiPath}:`, error);
      throw error;
    }
  }

  // Organizations route
  router.get('/organizations', async (req, res) => {
    const apiPath = '/organizations';
    try
    {
      const data = await fetchDataFromMeraki(apiPath);
      res.json(data);
    }catch (error) {res.status(500).send('Error fetching data from Meraki API. Please try again later.');}
  });

  // Networks route
  router.get('/organizations/:orgId/networks', async (req, res) => {
    const { orgId } = req.params;
    const apiPath = `/organizations/${orgId}/networks`;
    try {
      const data = await fetchDataFromMeraki(apiPath);
      res.json(data);
    }catch (error) {res.status(500).send(`Error fetching networks data for Org ID: ${orgId}`);}
  });

  // Devices route
  router.get('/networks/:netId/devices', async (req, res) => {
    const { netId } = req.params;
    const apiPath = `/networks/${netId}/devices`;
    try {
      const data = await fetchDataFromMeraki(apiPath);
      res.json(data);
    }catch (error) {res.status(500).send(`Error fetching devices data for Network ID: ${netId}`);}
  });

  // Sensor readings history by interval
  router.get('/organizations/:orgId/sensor/readings/history/byInterval', async (req, res) => {
    const { orgId } = req.params;
    const queryParams = req.query;
    const apiPath = `/organizations/${orgId}/sensor/readings/history/byInterval`;
    try {
      const data = await fetchDataFromMeraki(apiPath, queryParams);
      res.json(data);
    }catch (error)
    {
      console.error(`Error fetching sensor history by interval for organization ${orgId} with parameters ${JSON.stringify(queryParams)} from Meraki API. Please try again later.`);
      res.status(500).send(error.message);
    }
  });

  // Setup the cron job outside of route definitions
  cron.schedule('*/ * * * *', async function() {
    console.log('Running a task every 30 minutes to refresh cache');
    Object.keys(storage).forEach(async (key) => {
      try {
        const url = new URL(key);
        const apiPath = url.pathname;
        const queryParams = Object.fromEntries(url.searchParams);
  
        const data = await fetchDataFromMeraki(apiPath, queryParams);
        setCache(key, data);
        console.log(`Cache for ${key} refreshed.`);
      }catch (error) {console.error(`Failed to refresh cache for ${key}:`, error);}
    });
  });
  cron.schedule('*/1 * * * *', async function() {
    console.log('Running a task every 1 minute to refresh cache');
    Object.keys(storage).forEach(async (key) => {
      try 
      {
        const url = new URL(key);
        const apiPath = url.pathname;
        const queryParams = Object.fromEntries(url.searchParams);
        const data = await fetchDataFromMeraki(apiPath, queryParams);
        setCache(key, data);
        console.log(`Cache for ${key} refreshed.`);
      }catch (error) {console.error(`Failed to refresh cache for ${key}:`, error);}
    });
  });
  return router
}