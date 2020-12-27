module.exports = {
	async startCollection(bigQuerySvcObj, bigQueryDatasetId) {
		const dataset = bigQuerySvcObj.dataset(bigQueryDatasetId);
		const metadata = await dataset.getMetadata();
	},
};
