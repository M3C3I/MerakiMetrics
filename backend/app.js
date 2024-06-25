const express = require("express");
const cors = require("cors");
const path = require("path");
const merakiRoutes = require('./apis/meraki');
console.log(merakiRoutes);  // Check what's actually being imported
const app = express();
const PORT = process.env.PORT || 3301;

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const storage = {};

// Middleware to store data after each response
const storeDataMiddleware = (req, res, next) => {
    res.on('finish', () => {
        if (req.apiData) {
            storage[req.route.path] = req.apiData;
        }
    });
    next();
};

app.use(cors());
app.use(storeDataMiddleware);

// Mount the routes
app.use('/meraki', merakiRoutes(storage));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));