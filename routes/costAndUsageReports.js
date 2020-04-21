const express = require('express');
const router = express.Router();
const awsSvc = require('../services/awsSvc');
const awsCurSvc = require('../services/awsCostAndUsageReportsSvc');

//Middleware to validate the request payload. Usually, the request payload is expected to contain
//the Access ID associated with an IAM user. The AWS SDK is then configured to make use of the 
//required Access ID and the Secret Key.
router.use((req, res, next) => {
    awsSvc.validateIfAwsCredsPresent(req.body);
    next();
});

router.post('/cur/listReports', async (req, res) => {
    const listOfReports = await awsCurSvc.fetchListOfCostAndUsageReports();
    res.send(listOfReports);
})

module.exports = router;