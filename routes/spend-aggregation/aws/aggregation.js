const express = require("express");
const aggregationRoute = express.Router();

const AwsAccount = require("../../../models/aws/AwsAccount");
const AwsCollectionStatus = require("../../../models/collection/aws/collection-status");
const AwsCurProcessedData = require("../../../models/collection/aws/processed-data");

const awsCollectionSvc = require("../../../services/spend-aggregation/aws/collection");

const AWS = require("../../../utils/awsUtil");

aggregationRoute.post("/start-collection", async (req, res) => {
	try {
		const accountId = req.body.accountId;
		const awsAccount = await AwsAccount.findById(accountId);
		const s3ServiceObject = AWS.createNewS3Object(awsAccount.accessKeyId, awsAccount.secretAccessKey);
		await awsCollectionSvc.startCollection(awsAccount, s3ServiceObject); //Kicks off aggregation
		res.send();
	} catch (e) {
		res.status(500).send(e.message);
	}
});

// aggregationRoute.get("/collection-status", async (req, res) => {
// 	try {
// 		const accountId = req.query.accountId;
// 		const collectionStatus = await AwsCollectionStatus.find({ accountId });
// 		res.send(collectionStatus);
// 	} catch (e) {
// 		console.log(e.message);
// 		res.status(500).send();
// 	}
// });

aggregationRoute.get("/processed-data", async (req, res) => {
	try {
		const awsCurProcessedData = await AwsCurProcessedData.aggregate([
			{
				$match: {
					accountId: req.query.accountId,
				},
			},
			{
				$lookup: {
					from: "awscollectionstatuses",
					localField: "collectionStatuses",
					foreignField: "_id",
					as: "collectionStatuses",
				},
			},
		]);
		res.send(awsCurProcessedData[0]);
	} catch (e) {
		console.log(e.message);
		res.status(500).send();
	}
});

module.exports = aggregationRoute;
