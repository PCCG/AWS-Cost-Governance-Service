const express = require("express");
const aggregationRoute = express.Router();

const AwsAccount = require("../../../models/aws/AwsAccount");
const CostReport = require("../../../models/collection/cost-report");

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

aggregationRoute.get("/processed-data", async (req, res) => {
	try {
		const awsCurProcessedData = await CostReport.aggregate([
			{
				$match: {
					accountId: req.query.accountId,
				},
			},
			{
				$lookup: {
					from: "collectionstatuses",
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
