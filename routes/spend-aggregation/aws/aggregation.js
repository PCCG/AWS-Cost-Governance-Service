const express = require('express');
const aggregationRoute = express.Router();
const AwsAccount = require('../../../models/aws/AwsAccount');

const awsCollectionSvc = require('../../../services/spend-aggregation/aws/collection');

const AWS = require('../../../utils/awsUtil');

aggregationRoute.post('/aggregation/start-collection', async (req, res) => {
  try {
    const accountId = req.body.accountId;
    const awsAccount = await AwsAccount.findById(accountId);
    const s3ServiceObject = AWS.createNewS3Object(awsAccount.accessKeyId, awsAccount.secretAccessKey);
    await awsCollectionSvc.startCollection(awsAccount, s3ServiceObject); //Kicks off aggregation
    res.send();
  } catch (e) {
    res.status(500).send(e.message);
  }
})

module.exports = aggregationRoute;
