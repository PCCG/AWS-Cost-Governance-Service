const express = require('express');
const aggregationRoute = express.Router();

const validationMiddleware = require('../../services/aws/awsSvc').validateIfAwsCredsPresent;
const aggregationSvc = require('../../services/spend-aggregation/aggregator');

const cuReport = require('../../models/aws/cuReportModel');

const AWS = require('../../utils/awsUtil');

// Validates the request payload and appends the S3 service object to res.locals
aggregationRoute.use((req, res, next) => {
  validationMiddleware(req, res, next, AWS.createNewS3Object);
})

aggregationRoute.post('/aggregation/startAggregation', async (req, res) => {
  const s3ServiceObject = res.locals.serviceObject;
  const cur = new cuReport(req.body.cur);
  await aggregationSvc.startAggregation(cur, s3ServiceObject); //Kicks off aggregation
  res.send();
})

module.exports = aggregationRoute;
