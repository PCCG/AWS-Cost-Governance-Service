const AWS = require('aws-sdk')
const proxy = require('proxy-agent')

AWS.config = new AWS.Config()

AWS.config.region = 'us-east-1'
AWS.config.accessKeyId = ''
AWS.config.secretAccessKey = ''


AWS.updateAwsRegion = (region) => {
	AWS.config.region = region
}

AWS.updateAwsAccessKeyId = (accessKeyId) => {
	AWS.config.accessKeyId = accessKeyId
}

AWS.updateAwsSecretAccessKey = (secretAccessKey) => {
	AWS.config.secretAccessKey = secretAccessKey
}

AWS.createNewEC2Obj = () => new AWS.EC2()

AWS.createNewCostExplorerObj = () => new AWS.CostExplorer()

AWS.createNewS3Object = () => new AWS.S3()

AWS.createNewCurObject = () => new AWS.CUR()

AWS.createNewRdsObject = () => new AWS.RDS()

// AWS.config.update({
//     httpOptions: { agent: proxy("http://web-proxy.in.softwaregrp.net:8080") },
//     httpsOptions: { agent: proxy("http://web-proxy.in.softwaregrp.net:8080") }
// })

module.exports = AWS