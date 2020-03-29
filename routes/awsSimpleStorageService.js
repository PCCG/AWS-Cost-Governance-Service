const express = require('express');
const router = express.Router();

const awsSvc = require('../services/awsSvc');
const awsS3Svc = require('../services/awsSimpleStorageServiceSvc');

const service = 'Amazon Simple Storage Service';

router.post('/s3/listBuckets', async (req, res) => {
    awsSvc.validateIfAwsCredsPresent(req.body, res);
    const listOfS3Buckets = await awsS3Svc.fetchBucketsAcrossAllRegions();
    res.send(listOfS3Buckets);
})

router.post('/s3/cost/getSpendPattern', function (req, res) {
    awsSvc.validateIfAwsCredsPresent(req.body, res);
    awsSvc.getCostPattern(service).then(costPattern => {
        res.send(costPattern)
    })
})

router.post('/s3/cost/getSpendCurrentMonth', function (req, res) {
    awsSvc.validateIfAwsCredsPresent(req.body, res)
    awsSvc.getCostCurrentMonth(service).then(cost => {
        res.send(cost)
    })
})

module.exports = router;