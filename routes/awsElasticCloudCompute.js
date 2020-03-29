const express = require('express');
const router = express.Router();

const awsEc2Svc = require('../services/awsElasticCloudComputeSvc.js');

router.post('/aws/ec2/fetchInstances', function(req, res){
    AWS = awsEc2Svc.validateIfAwsCredsPresent(req.body, res);
    awsEc2Svc.fetchEc2InstancesAcrossRegions().then(instancesAcrossRegions => {
        res.send(instancesAcrossRegions)
    })
})

router.post('/aws/ec2/cost/getSpendPattern', function (req, res) {
    AWS = awsEc2Svc.validateIfAwsCredsPresent(req.body, res);
    awsEc2Svc.getCostPattern().then(costPattern => {
        res.send(costPattern)
    })
})

router.post('/aws/ec2/cost/getSpendCurrentMonth', function (req, res) {
    awsEc2Svc.validateIfAwsCredsPresent(req.body, res)
    awsEc2Svc.getCostCurrentMonth().then(cost => {
        res.send(cost)
    })
})

module.exports = router;