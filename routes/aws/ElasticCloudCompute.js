const express = require('express');
const router = express.Router();

const awsSvc = require('../../services/aws/awsSvc');
const awsEc2Svc = require('../../services/aws/awsElasticCloudComputeSvc.js');

const AWS = require('../../utils/awsUtil');

router.use((req, res, next) => {
    awsSvc.validateIfAwsCredsPresent(req, res, next, AWS.createNewEC2Object);
})

router.post('/ec2/fetchInstances', async (req, res) => {
    const ec2ServiceObject = res.locals.serviceObject;
    const instancesAssociatedWithAccount = await awsEc2Svc.fetchEc2InstancesAssociatedWithAccount(ec2ServiceObject);
    res.send(instancesAssociatedWithAccount);
})

module.exports = router;
