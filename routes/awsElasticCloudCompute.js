const express = require('express');
const router = express.Router();

const awsSvc = require('../services/awsSvc');
const awsEc2Svc = require('../services/awsElasticCloudComputeSvc.js');

const service = 'Amazon Elastic Compute Cloud - Compute';

router.post('/ec2/fetchInstances', function(req, res){
    awsSvc.validateIfAwsCredsPresent(req.body, res);
    awsEc2Svc.fetchEc2InstancesAcrossRegions().then(instancesAcrossRegions => {
        res.send(instancesAcrossRegions)
    })
})

router.post('/ec2/cost/getSpendPattern', function (req, res) {
    awsSvc.validateIfAwsCredsPresent(req.body, res);
    awsSvc.getCostPattern(service).then(costPattern => {
        res.send(costPattern)
    })
})

router.post('/ec2/cost/getSpendCurrentMonth', function (req, res) {
    awsSvc.validateIfAwsCredsPresent(req.body, res)
    awsSvc.getCostCurrentMonth(service).then(cost => {
        res.send(cost)
    })
})

module.exports = router;