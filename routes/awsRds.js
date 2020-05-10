const router = require('express').Router();

const AWS = require('../utils/awsUtil');

const awsSvc = require('../services/awsSvc');
const awsRdsSvc = require('../services/awsRdsSvc');

router.use((req, res, next) => {
    awsSvc.validateIfAwsCredsPresent(req, res, next, AWS.createNewRdsObject);
})

router.post('/rds/listAllRdsInstances', async (req, res) => {
    const rdsServiceObject = res.locals.serviceObject;
    const listOfRdsInstancesAcrossAllRegions = await awsRdsSvc.fetchRdsInstancesAssociatedWithAccount(rdsServiceObject);
    res.send(listOfRdsInstancesAcrossAllRegions);
})

module.exports = router;