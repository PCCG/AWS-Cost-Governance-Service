const GcpSpendAggregationRoute = require("express").Router();
const { createBigQuerySvcObj } = require("../../../utils/GcpUtil");
const GcpAccount = require("../../../models/gcp/GcpAccount");

// Inercept the request and create the service object
const GcpSpendAggregationRouteMiddleware = (req, res, next) => {
	GcpSvc.createServiceObject(req, res, next, createBigQuerySvcObj);
};

GcpSpendAggregationRoute.use(GcpSpendAggregationRouteMiddleware);

GcpSpendAggregationRoute.get("/start-collection", async function (req, res) {
	try {
		const bigQuerySvcObj = res.locals.serviceObject;
		const gcpAccount = GcpAccount.findById(accountId);
		await cloudStorageServiceObject.startCollection(gcpAccount, bigQuerySvcObj);
	} catch (e) {
		console.log(e.message);
		res.status(500).send();
	}
});

module.exports = GcpSpendAggregationRoute;
