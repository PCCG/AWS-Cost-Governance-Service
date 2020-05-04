const express = require('express');
const router = express.Router();

const awsSvc = require('../services/awsSvc');
const awsCeSvc = require('../services/awsCostExplorerSvc');

const AWS = require('../utils/awsUtil');

router.use((req, res, next) => {
    awsSvc.validateIfAwsCredsPresent(req, res, next, AWS.createNewCostExplorerObject);
})

router.post('/cost/getSpendPattern', async (req, res) => {
    const costExplorerServiceFilter = req.body.costExplorerServiceFilter;
    const ceServiceObject = res.locals.serviceObject;
    const spendPattern = await awsCeSvc.getCostPattern(ceServiceObject, costExplorerServiceFilter);
    res.send(spendPattern);
})

router.post('/cost/getSpendCurrentMonth', async (req, res) => {
    const costExplorerServiceFilter = req.body.costExplorerServiceFilter;
    const ceServiceObject = res.locals.serviceObject;
    const spendForTheCurrentMonth = awsCeSvc.getCostCurrentMonth(ceServiceObject, costExplorerServiceFilter);
    res.send(spendForTheCurrentMonth);
})

module.exports = router;