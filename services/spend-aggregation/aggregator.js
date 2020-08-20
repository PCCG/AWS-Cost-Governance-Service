const moment = require('moment');
const fs = require('fs');

const s3svc = require('../aws/awsSimpleStorageServiceSvc');

/* The service is responsible for fetching Cost & Usage Reports (CURs) from a S3 bucket.
   To construct the path to the report, we process the CUR object that houses the prefix,
   the name of the report and the name of the S3 bucket (we first process the manifest file that
   houses details w.r.t the report).
*/

//Aggregation can manually be initiated by a user. Generally, it's initiated by the monitoring service
async function startAggregation (cur, s3ServiceObject) {
  const fullPathToReport = await constructPathToReport(cur, s3ServiceObject);
  const cuReportOctetStream = await s3svc.fetchObjectFromBucket(cur.getBucketName(), fullPathToReport, s3ServiceObject);
  const cuReport = fs.createWriteStream('../../assets/cur/cuReport.csv.gz', {encoding: 'utf8'});
  cuReport.write(cuReportOctetStream);
}

//This method constructs the path to access the report that is present in a bucket.
async function constructPathToReport (cur, s3ServiceObject) {
  const pathToReportKey = 'reportKeys';
  const startDate = moment().startOf('month').format('YYYYMMDD'); //Date corresponding to the first day of the month
  const endDate = moment().add(1, 'month').startOf('month').format('YYYYMMDD'); //Date corresponsing to the first day of the next month
  const pathToManifestFile = `${cur.getPrefix()}/${cur.getReportName()}/${startDate}-${endDate}/${cur.getReportName()}-Manifest.json`; //The path to the manifest file
  const manifestOctetStream = await s3svc.fetchObjectFromBucket(cur.getBucketName(), pathToManifestFile, s3ServiceObject); //The response is of the type application/octet-stream
  const manifestJson = JSON.parse(manifestOctetStream.toString('utf-8')); //Construct a JSON out of the response
  const pathToReport = manifestJson[pathToReportKey];
  return pathToReport;
}

module.exports = {
  startAggregation
}
