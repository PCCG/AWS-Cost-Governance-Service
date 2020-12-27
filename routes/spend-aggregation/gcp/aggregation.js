const GcpSpendAggregationRoute = require("express").Router();
const { createBigQuerySvcObj } = require("../../../utils/GcpUtil");
const GcpSvc = require("../../../services/gcp/gcpSvc.js");
const GcpAccount = require("../../../models/gcp/GcpAccount");
const GcpSpendAggregationSvc = require("../../../services/spend-aggregation/gcp/collection");

// Inercept the request and create the service object
const GcpSpendAggregationRouteMiddleware = (req, res, next) => {
	GcpSvc.validateIfAccountIdPresent(req, res, next, createBigQuerySvcObj);
};

GcpSpendAggregationRoute.use(GcpSpendAggregationRouteMiddleware);

GcpSpendAggregationRoute.post("/start-collection", async function (req, res) {
	try {
		const bigQuerySvcObj = res.locals.serviceObject;
		const gcpAccount = await GcpAccount.findById(req.body.accountId);
		await GcpSpendAggregationSvc.startCollection(bigQuerySvcObj, gcpAccount.bigQueryDataset);
	} catch (e) {
		console.log(e.message);
		res.status(500).send();
	}
});

module.exports = GcpSpendAggregationRoute;
