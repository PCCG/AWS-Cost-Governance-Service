const express = require('express');
const router = express.Router();

const AWS = require('../utils/awsUtil');

const awsSvc = require('../services/awsSvc');
const awsS3Svc = require('../services/awsSimpleStorageServiceSvc');

router.use((req, res, next) => {
    awsSvc.validateIfAwsCredsPresent(req, res, next, AWS.createNewS3Object);
})

router.post('/s3/listBuckets', async (req, res) => {
    const s3ServiceObject = res.locals.serviceObject;
    const listOfS3Buckets = await awsS3Svc.fetchBucketsAcrossAllRegions(s3ServiceObject);
    res.send(listOfS3Buckets);
})

module.exports = router;