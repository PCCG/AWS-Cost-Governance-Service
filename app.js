const express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const AWS_API_ENDPOINT = '/api/v1/aws';

const accountsRoute = require('./routes/awsAccounts');
const ec2Route = require('./routes/awsElasticCloudCompute');
const s3Route = require('./routes/awsSimpleStorageService');
const curRoute = require('./routes/costAndUsageReports');
const rdsRoute = require('./routes/awsRds');


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(AWS_API_ENDPOINT, accountsRoute);
app.use(AWS_API_ENDPOINT, ec2Route);
app.use(AWS_API_ENDPOINT, s3Route);
app.use(AWS_API_ENDPOINT, curRoute);
app.use(AWS_API_ENDPOINT, rdsRoute);

module.exports = app;
