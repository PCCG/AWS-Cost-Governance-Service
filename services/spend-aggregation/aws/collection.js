const moment = require('moment');
const fs = require('fs');
const util = require('util');
const path = require('path');
const zlib = require('zlib');
const { parse } = require('@fast-csv/parse');

const s3svc = require('../../aws/awsSimpleStorageServiceSvc');

const AwsCollectionStatus = require('../../../models/collection/aws/collection-status');

const convertBufferToStream = require('../../../utils/bufferToStream');

/* The service is responsible for fetching Cost & Usage Reports (CURs) from a S3 bucket.
   To construct the path to the report, we process the CUR object that houses the prefix,
   the name of the report and the name of the S3 bucket (we first process the manifest file that
   houses details w.r.t the report).
*/
async function startCollection (awsAccount, s3ServiceObject) {
  const foldersToProcessKey = 'CommonPrefixes';
  const prefix = `${awsAccount.reportPrefix}/${awsAccount.reportName}/`;
  const directoryPath = path.resolve(__dirname, `../../../assets/aws/cur/${awsAccount._id}`);
  // Store the reports in a folder named after the account ID
  try {
    const fileExists = await util.promisify(fs.exists)(directoryPath, fs.constants.F_OK);
    if (!fileExists){
      await util.promisify(fs.mkdir)(directoryPath, { recursive: true });
      const response = await s3ServiceObject.listObjectsV2({
        Bucket: awsAccount.s3Bucket,
        Delimiter: '/',
        Prefix: prefix
      }).promise();
      const foldersToProcess = response[foldersToProcessKey];
      foldersToProcess.forEach(async (folder) => {
        const collectionStatus = create_collection_status(awsAccount._id);
        const billingPeriod = folder.Prefix.replace(prefix, '').replace('/', '');
        const pathToManifestFile = `${folder.Prefix}${awsAccount.reportName}-Manifest.json`; //The path to the manifest file
        fetchReportFromBucket(awsAccount, pathToManifestFile, s3ServiceObject, collectionStatus);
      });
    } else {
      const collectionStatus = create_collection_status(awsAccount._id);
      const billingPeriod = `${moment().startOf('month').format('YYYYMMDD')}-${moment().add(1, 'month').startOf('month').format('YYYYMMDD')}`; //Date corresponding to the first day of the month
      const pathToManifestFile = `${prefix}${billingPeriod}/${awsAccount.reportName}-Manifest.json`;
      fetchReportFromBucket(awsAccount, pathToManifestFile, s3ServiceObject, collectionStatus);
    }
  } catch (e) {
    collectionStatus.collectionStatus = 'failed';
    collectionStatus.save();
    console.log(e.message);
  }
}

function create_collection_status (awsAccountId) {
  const collectionStatus = new AwsCollectionStatus();
  collectionStatus.accountId = awsAccountId;
  collectionStatus.timestamp = new Date();
  return collectionStatus;
}

async function fetchReportFromBucket (awsAccount, pathToManifestFile, s3ServiceObject, collectionStatus) {
  const pathToReportKey = 'reportKeys';
  const manifestOctetStream = await s3svc.fetchObjectFromBucket(awsAccount.s3Bucket, pathToManifestFile, s3ServiceObject); //The response is of the type application/octet-stream
  const manifestJson = JSON.parse(manifestOctetStream.toString('utf-8')); //Construct a JSON out of the response
  const pathToReport = manifestJson[pathToReportKey][0];
  // Response of the type application/octet-stream. The response represents binary data and is passed to a stream
  const cuReportOctetStream = await s3svc.fetchObjectFromBucket(awsAccount.s3Bucket, pathToReport, s3ServiceObject);
  const cuReportStream = convertBufferToStream(cuReportOctetStream);
  const rows_in_report = [];
  cuReportStream
    .pipe(zlib.createUnzip())
    .pipe(parse({ headers: true }))
    .on('data', row => {
      if(parseFloat(row['lineItem/UnblendedCost']) || parseFloat(row['lineItem/BlendedCost'])) {
        rows_in_report.push(row);
      }
    })
    .on('end', number_of_records => {
      collectionStatus.number_of_records = number_of_records;
      collectionStatus.save();
    });
}


module.exports = {
  startCollection
}
