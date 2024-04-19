const express = require('express');
const cors = require('cors');

const app = express();
const path = require('path');
const proxyRoutes = require('./proxyRoutes');
const PORT = process.env.PORT || 3301;

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
app.use(cors());
app.use(proxyRoutes);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
