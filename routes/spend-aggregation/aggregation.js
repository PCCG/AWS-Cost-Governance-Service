const express = require('express');
const aggregationRoute = express.Router();
const AwsAccount = require('../../models/aws/AwsAccount');

const aggregationSvc = require('../../services/spend-aggregation/aggregator');

const AWS = require('../../utils/awsUtil');

aggregationRoute.post('/aggregation/startAggregation', async (req, res) => {
  try {
    const accountId = req.body.accountId;
    const awsAccount = await AwsAccount.findById(accountId);
    const s3ServiceObject = AWS.createNewS3Object(awsAccount.accessKeyId, awsAccount.secretAccessKey);
    await aggregationSvc.startAggregation(awsAccount, s3ServiceObject); //Kicks off aggregation
    res.send();
  } catch (e) {
    res.status(500).send(e.message);
  }
})

module.exports = aggregationRoute;
