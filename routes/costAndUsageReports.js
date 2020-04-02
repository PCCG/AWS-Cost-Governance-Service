const express = require('express');
const router = express.Router();
const awsSvc = require('../services/awsSvc');
const awsCurSvc = require('../services/awsCostAndUsageReportsSvc');

router.post('/cur/listReports', async (req, res) => {
    awsSvc.validateIfAwsCredsPresent(req.body);
    const listOfReports = await awsCurSvc.fetchListOfCostAndUsageReports();
    res.send(listOfReports);
})

module.exports = router;