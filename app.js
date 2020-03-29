const express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const accountsRoute = require('./routes/awsAccounts');
const ec2Route = require('./routes/awsElasticCloudCompute');
const s3Route = require('./routes/awsSimpleStorageService');


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/aws', accountsRoute);
app.use('/api/v1/aws', ec2Route);
app.use('/api/v1/aws', s3Route);

module.exports = app;
