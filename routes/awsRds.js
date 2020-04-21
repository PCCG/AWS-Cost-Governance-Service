const router = require('express').Router();

const awsSvc = require('../services/awsSvc');
const awsRdsSvc = require('../services/awsRdsSvc');

router.use((req, res, next) => {
    awsSvc.validateIfAwsCredsPresent(req.body, res);
    next();
})

router.post('/rds/listAllRdsInstances', async (req, res) => {
    const listOfRdsInstancesAcrossAllRegions = await awsRdsSvc.fetchRdsInstancesAcrossAllRegions();
    res.send(listOfRdsInstancesAcrossAllRegions);
})

module.exports = router;