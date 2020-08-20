/*  This file is responsible for exposing methods that help in creating service objects
    This file merely acts as a wrapper on top of the AWS SDK. It should be kept in mind that
    certain services such as the Cost Explorer expose endpoints in a specific region. It 
    does not make sense to expose a wrapper function that accepts region as a parameter. A wrapper
    function in general should accept the Access Key ID and the Secret Access Key as parameters. If
    the service exposes endpoints in multiple regions, then the wrapper function is supposed to accept
    region as a parameter.
*/

const AWS = require('aws-sdk');
const proxy = require('proxy-agent');

//Moving away from the global configuration applicable to the AWS SDK. The configuration will now be applicable to
//a particular service. This way, when the server is busy processing multiple requests, we create the service instance
//with the credentials applicable to the particular request

const AWS_COST_EXPLORER_REGION = 'us-east-1';
const AWS_CUR_REGION = 'us-east-1';
//If the application is going to be containerized, expose a YAML paramater that users can configure to set the variable mentioned below
const AWS_DEFAULT_SERVICE_ENDPOINT_REGION = process.env.AWS_DEFAULT_SERVICE_ENDPOINT_REGION || 'us-east-1';

AWS.createNewEC2Object = (accessKeyId, secretAccessKey, region = AWS_DEFAULT_SERVICE_ENDPOINT_REGION) => new AWS.EC2({accessKeyId, secretAccessKey, region});

AWS.createNewCostExplorerObject = (accessKeyId, secretAccessKey) => new AWS.CostExplorer({accessKeyId, secretAccessKey, region: AWS_COST_EXPLORER_REGION});

AWS.createNewS3Object = (accessKeyId, secretAccessKey, region = AWS_DEFAULT_SERVICE_ENDPOINT_REGION) => new AWS.S3({accessKeyId, secretAccessKey, region});

AWS.createNewCurObject = (accessKeyId, secretAccessKey) => new AWS.CUR({accessKeyId, secretAccessKey, region: AWS_CUR_REGION});

AWS.createNewRdsObject = (accessKeyId, secretAccessKey, region = AWS_DEFAULT_SERVICE_ENDPOINT_REGION) => new AWS.RDS({accessKeyId, secretAccessKey, region});

AWS.convertAvailabilityZoneToRegion = availabilityZone => availabilityZone.slice(0, -1);

// AWS.config.update({
//     httpOptions: { agent: proxy("") },
//     httpsOptions: { agent: proxy("") }
// })

module.exports = AWS
