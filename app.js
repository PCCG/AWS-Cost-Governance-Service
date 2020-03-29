const express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const accountsRoute = require('./routes/awsAccounts');
const ec2Route = require('./routes/awsElasticCloudCompute');


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', accountsRoute);
app.use('/api/v1', ec2Route);

module.exports = app;
