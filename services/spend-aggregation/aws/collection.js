const moment = require('moment');
const fs = require('fs');
const path = require('path');

const s3svc = require('../../aws/awsSimpleStorageServiceSvc');

/* The service is responsible for fetching Cost & Usage Reports (CURs) from a S3 bucket.
   To construct the path to the report, we process the CUR object that houses the prefix,
   the name of the report and the name of the S3 bucket (we first process the manifest file that
   houses details w.r.t the report).
*/

//Aggregation can manually be initiated by a user. Generally, it's initiated by the monitoring service
async function startCollection (awsAccount, s3ServiceObject) {
  const fullPathToReport = await constructPathToReport(awsAccount, s3ServiceObject);
  // Response of the type application/octet-stream. The response represents binary data and is passed to a stream
  const cuReportOctetStream = await s3svc.fetchObjectFromBucket(awsAccount.s3Bucket, fullPathToReport, s3ServiceObject);
  const cuReport = fs.createWriteStream(path.resolve(__dirname, '../../../assets/cost-and-usage-report.csv.gz'), {encoding: 'utf8'});
  // Wait for the file to be opened and then write data into the file
  cuReport.on('open', () => {
    cuReport.write(cuReportOctetStream);
    cuReport.end();
  });
}

//This method constructs the path to access the report that is present in a bucket.
async function constructPathToReport (awsAccount, s3ServiceObject) {
  const pathToReportKey = 'reportKeys';
  const startDate = moment().subtract(1, 'month').startOf('month').format('YYYYMMDD'); //Date corresponding to the first day of the month
  const endDate = moment().startOf('month').format('YYYYMMDD'); //Date corresponsing to the first day of the next month
  const pathToManifestFile = `${awsAccount.reportPrefix}/${awsAccount.reportName}/${startDate}-${endDate}/${awsAccount.reportName}-Manifest.json`; //The path to the manifest file
  const manifestOctetStream = await s3svc.fetchObjectFromBucket(awsAccount.s3Bucket, pathToManifestFile, s3ServiceObject); //The response is of the type application/octet-stream
  const manifestJson = JSON.parse(manifestOctetStream.toString('utf-8')); //Construct a JSON out of the response
  const pathToReport = manifestJson[pathToReportKey][0];
  return pathToReport;
}

module.exports = {
  startAggregation
}
