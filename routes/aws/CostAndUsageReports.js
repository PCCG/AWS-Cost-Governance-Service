const express = require('express');
const router = express.Router();

const AWS = require('../../utils/awsUtil');

const awsSvc = require('../../services/aws/awsSvc');
const awsCurSvc = require('../../services/aws/awsCostAndUsageReportsSvc');

//Middleware to validate the request payload. Usually, the request payload is expected to contain
//the Access ID associated with an IAM user. Depending on the service, the AWS SDK is then configured to make use of the
//required Access ID and the Secret Key.
router.use((req, res, next) => {
    awsSvc.validateIfAwsCredsPresent(req, res, next, AWS.createNewCurObject);
});

router.post('/cur/listReports', async (req, res) => {
    const curServiceObject = res.locals.serviceObject;
    const listOfReports = await awsCurSvc.fetchListOfCostAndUsageReports(curServiceObject);
    res.send(listOfReports);
})

module.exports = router;
