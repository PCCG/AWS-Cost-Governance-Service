const moment = require('moment');
const fs = require('fs');
const util = require('util');
const path = require('path');

const s3svc = require('../../aws/awsSimpleStorageServiceSvc');

const AwsCollectionStatus = require('../../../models/collection/aws/collection-status');

/* The service is responsible for fetching Cost & Usage Reports (CURs) from a S3 bucket.
   To construct the path to the report, we process the CUR object that houses the prefix,
   the name of the report and the name of the S3 bucket (we first process the manifest file that
   houses details w.r.t the report).
*/
async function startCollection (awsAccount, s3ServiceObject) {
  const foldersToProcessKey = 'CommonPrefixes';
  const prefix = `${awsAccount.reportPrefix}/${awsAccount.reportName}/`;
  const directoryPath = path.resolve(__dirname, `../../../assets/aws/cur/${awsAccount.aliasName}`);
  const collectionStatus = new AwsCollectionStatus();
  collectionStatus.accountId = awsAccount._id;
  collectionStatus.timestamp = new Date();
  // Store the reports in a folder with a name that represents the alias name for the account
  try {
    if (!fs.existsSync(directoryPath)){
      await util.promisify(fs.mkdir)(directoryPath, { recursive: true });
      const response = await s3ServiceObject.listObjectsV2({
        Bucket: awsAccount.s3Bucket,
        Delimiter: '/',
        Prefix: prefix
      }).promise();
      const foldersToProcess = response[foldersToProcessKey];
      foldersToProcess.forEach(async (folder) => {
        const billingPeriod = folder.Prefix.replace(prefix, '').replace('/', '');
        const pathToManifestFile = `${folder.Prefix}${awsAccount.reportName}-Manifest.json`; //The path to the manifest file
        fetchReportFromBucket(awsAccount, directoryPath, billingPeriod, pathToManifestFile, s3ServiceObject);
      });
    } else {
      const billingPeriod = `${moment().startOf('month').format('YYYYMMDD')}-${moment().add(1, 'month').startOf('month').format('YYYYMMDD')}`; //Date corresponding to the first day of the month
      const pathToManifestFile = `${prefix}${billingPeriod}/${awsAccount.reportName}-Manifest.json`;
      await fetchReportFromBucket(awsAccount, directoryPath, billingPeriod, pathToManifestFile, s3ServiceObject);
    }
  } catch (e) {
    collectionStatus.collectionStatus = 'failed';
    console.log(e.message);
  } finally {
    collectionStatus.save();
  }
}

async function fetchReportFromBucket (awsAccount, directoryPath, billingPeriod, pathToManifestFile, s3ServiceObject) {
  const pathToReportKey = 'reportKeys';
  const manifestOctetStream = await s3svc.fetchObjectFromBucket(awsAccount.s3Bucket, pathToManifestFile, s3ServiceObject); //The response is of the type application/octet-stream
  const manifestJson = JSON.parse(manifestOctetStream.toString('utf-8')); //Construct a JSON out of the response
  const pathToReport = manifestJson[pathToReportKey][0];
  // Response of the type application/octet-stream. The response represents binary data and is passed to a stream
  const cuReportOctetStream = await s3svc.fetchObjectFromBucket(awsAccount.s3Bucket, pathToReport, s3ServiceObject);
  const cuReport = fs.createWriteStream(`${directoryPath}/${billingPeriod}.csv.gz`, {encoding: 'utf8'});
  // Wait for the file to be opened and then write data into the file
  cuReport.on('open', () => {
    cuReport.write(cuReportOctetStream);
    cuReport.end();
  });
}


module.exports = {
  startCollection
}
