const GcpSpendAggregationRoute = require("express").Router();
const { createBigQuerySvcObj } = require("../../../utils/GcpUtil");
const GcpSvc = require("../../../services/gcp/gcpSvc.js");
const GcpAccount = require("../../../models/gcp/GcpAccount");
const GcpSpendAggregationSvc = require("../../../services/spend-aggregation/gcp/collection");
const CollectionStatus = require("../../../models/collection/collection-status");

// Inercept the request and create the service object
const GcpSpendAggregationRouteMiddleware = (req, res, next) => {
	GcpSvc.validateIfAccountIdPresent(req, res, next, createBigQuerySvcObj);
};

GcpSpendAggregationRoute.use(GcpSpendAggregationRouteMiddleware);

GcpSpendAggregationRoute.post("/start-collection", async function (req, res) {
	const accountId = req.body.accountId;
	const collectionStatus = new CollectionStatus();
	collectionStatus.timestamp = new Date();
	collectionStatus.accountId = accountId;
	try {
		const bigQuerySvcObj = res.locals.serviceObject;
		const gcpAccount = await GcpAccount.findById(accountId);
		await GcpSpendAggregationSvc.startCollection(bigQuerySvcObj, gcpAccount.bigQueryDataset, gcpAccount.billingAccount);
		collectionStatus.status = "success";
	} catch (e) {
		collectionStatus.status = "failed";
		console.log(e.message);
		res.status(500).send();
	} finally {
		collectionStatus.save();
	}
});

module.exports = GcpSpendAggregationRoute;
