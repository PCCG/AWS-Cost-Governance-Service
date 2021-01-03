module.exports = {
	async startCollection(bigQuerySvcObj, bigQueryDatasetId, billingAccount) {
		const [dataset] = await bigQuerySvcObj.dataset(bigQueryDatasetId).get();
		const datasetLocation = dataset.metadata.location;
		const query = `select * from ${bigQueryDatasetId}.gcp_billing_export_v1_${billingAccount.replace(/-/g, "_")} where cost > 0`;
		// Run the query as a job
		const [job] = await bigQuerySvcObj.createQueryJob({
			query,
			location: datasetLocation,
		});
		console.log(`Job ${job.id} started...`);
		// Wait for the query to finish
		const [rows] = await job.getQueryResults();
		console.log(rows[0]);
	},
};
