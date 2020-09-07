require('dotenv').config();
const express = require('express');
var path = require('path');
var cors = require('cors')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');

const AWS_API_ENDPOINT = '/api/v1/aws';
const GCP_API_ENDPOINT = '/api/v1/gcp';

// AWS
const awsAccountsRoute = require('./routes/aws/Accounts');
const awsEc2Route = require('./routes/aws/ElasticCloudCompute');
const awsS3Route = require('./routes/aws/SimpleStorageService');
const awsCurRoute = require('./routes/aws/CostAndUsageReports');
const awsRdsRoute = require('./routes/aws/Rds');

// GCP
const gcpAccountsRoute = require('./routes/gcp/Accounts');

// Spend Aggregation
const aggregatorRoute = require('./routes/spend-aggregation/aws/aggregation');


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());


/*The order in which routers are specified does matter. The middlewares that are specific to the
routes that are specified first somehow act upon the router (which does not house any middlewares)
that is specified in the end.*/
app.use(AWS_API_ENDPOINT, aggregatorRoute);
app.use(AWS_API_ENDPOINT, awsAccountsRoute);
app.use(`${GCP_API_ENDPOINT}/accounts/`, gcpAccountsRoute);
app.use(AWS_API_ENDPOINT, awsEc2Route);
app.use(AWS_API_ENDPOINT, awsS3Route);
app.use(AWS_API_ENDPOINT, awsCurRoute);
app.use(AWS_API_ENDPOINT, awsRdsRoute);

mongoose.connect('mongodb+srv://costgovernanceserviceuser:Ajith%401996@cost-governance-service.j0ncg.gcp.mongodb.net/cgsdb?retryWrites=true&w=majority', {
  useNewUrlParser: true
}).then(() => {
  console.log('Connected to the MongoDB instance....');
}).catch((e) => {
  console.log(e.message);
  console.log('Not able to connect to the MongoDB instance...');
});

module.exports = app;
