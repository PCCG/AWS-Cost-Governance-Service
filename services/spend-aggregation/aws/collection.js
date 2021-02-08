const path = require("path");

const s3svc = require("../../aws/awsSimpleStorageServiceSvc");
const processReport = require("./process-cur");

const AwsCollectionStatus = require("../../../models/collection/aws/collection-status");

/* The service is responsible for fetching Cost & Usage Reports (CURs) from a S3 bucket.
   To construct the path to the report, we process the CUR object that houses the prefix,
   the name of the report and the name of the S3 bucket (we first process the manifest file that
   houses details w.r.t the report).
*/
async function startCollection(awsAccount, s3ServiceObject) {
	const foldersToProcessKey = "CommonPrefixes";
	const prefix = `${awsAccount.reportPrefix}/${awsAccount.reportName}/`;
	try {
		const collectionStatus = create_collection_status(awsAccount._id);
		const response = await s3ServiceObject
			.listObjectsV2({
				Bucket: awsAccount.s3Bucket,
				Delimiter: "/",
				Prefix: prefix,
			})
			.promise();
		const foldersToProcess = response[foldersToProcessKey];
		let reportsToBeProcessed = [];
		foldersToProcess.forEach(async (folder) => {
			const billingPeriod = folder.Prefix.replace(prefix, "").replace("/", "");
			const pathToManifestFile = `${folder.Prefix}${awsAccount.reportName}-Manifest.json`; //The path to the manifest file
			reportsToBeProcessed.push(fetchReportFromBucket(awsAccount, pathToManifestFile, s3ServiceObject));
		});
		reportsToBeProcessed = await Promise.all(reportsToBeProcessed);
		processReport(reportsToBeProcessed, collectionStatus);
	} catch (e) {
		collectionStatus.collectionStatus = "failed";
		collectionStatus.save();
		console.log(e.message);
	}
}

function create_collection_status(awsAccountId) {
	const collectionStatus = new AwsCollectionStatus();
	collectionStatus.accountId = awsAccountId;
	collectionStatus.timestamp = new Date();
	return collectionStatus;
}

async function fetchReportFromBucket(awsAccount, pathToManifestFile, s3ServiceObject) {
	const pathToReportKey = "reportKeys";
	const manifestOctetStream = await s3svc.fetchObjectFromBucket(awsAccount.s3Bucket, pathToManifestFile, s3ServiceObject); //The response is of the type application/octet-stream
	const manifestJson = JSON.parse(manifestOctetStream.toString("utf-8")); //Construct a JSON out of the response
	const pathToReport = manifestJson[pathToReportKey][0];
	// Response of the type application/octet-stream. The response represents binary data and is passed to a stream
	const cuReportOctetStream = await s3svc.fetchObjectFromBucket(awsAccount.s3Bucket, pathToReport, s3ServiceObject);
	return cuReportOctetStream;
}

module.exports = {
	startCollection,
};
