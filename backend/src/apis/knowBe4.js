const express = require('express');
const axios = require('axios');

module.exports = (storage) => {
  const router = express.Router();

  router.get('/account', async (req, res) => {
    try {
      if (storage.knowBe4AccountName) {
        return res.json({ name: storage.knowBe4AccountName });
      }

      const response = await axios.get('https://us.api.knowbe4.com/v1/account', {
        headers: {
          'Authorization': `Bearer ${process.env.KNOWBE4_API_KEY}`,
        },
      });


      if (response.data) {

        storage.knowBe4AccountName = response.data.name;
        req.apiData = { Name: response.data.name };
      }
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching data from KnowBe4 API');
    }
  });

  return router;
};