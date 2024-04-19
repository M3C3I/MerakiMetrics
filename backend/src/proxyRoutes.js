const express = require('express');
const merakiRoutes = require('./apis/meraki');
const knowBe4Routes = require('./apis/knowBe4');

const router = express.Router();

const storage = {};

const storeDataMiddleware = (req, res, next) => {
    res.on('finish', () => {
        if (req.apiData) {
            storage[req.route.path] = req.apiData;
        }
    });
    next();
};

router.use(storeDataMiddleware);

router.use('/meraki', merakiRoutes(storage));
router.use('/knowbe4', knowBe4Routes(storage));

module.exports = router;
