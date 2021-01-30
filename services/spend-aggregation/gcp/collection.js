const moment = require("moment");

module.exports = {
	async startCollection(bigQuerySvcObj, bigQueryDatasetId, billingAccount) {
		const [dataset] = await bigQuerySvcObj.dataset(bigQueryDatasetId).get();
		const datasetLocation = dataset.metadata.location;
		const billingAccountId = billingAccount.replace(/-/g, "_");
		const exportTimeStartKey = "export_time_start";
		const exportTimeEndKey = "export_time_end";
		const exportTimeQuery = `select min(export_time) as ${exportTimeStartKey}, max(export_time) as ${exportTimeEndKey} from ${bigQueryDatasetId}.gcp_billing_export_v1_${billingAccountId}`;
		const exportTime = await runQueryAsJob(bigQuerySvcObj, datasetLocation, exportTimeQuery);
		let exportTimeStart = exportTime[0][exportTimeStartKey].value;
		let exportTimeEnd = exportTime[0][exportTimeEndKey].value;
		exportTimeStart = moment(exportTimeStart).startOf("month").format("YYYY-MM-DD");
		exportTimeEnd = moment(exportTimeEnd).add(1, "month").startOf("month").format("YYYY-MM-DD");
		let nextMonth = moment(exportTimeStart).add(1, "month").startOf("month").format("YYYY-MM-DD");
		let monthStart = exportTimeStart;
		const costByServicePromises = [];
		const costByLocationPromises = [];
		const costByProjectPromises = [];
		while (new Date(nextMonth) <= new Date(exportTimeEnd)) {
			const costByServiceQuery = `select service.description as service_description, sum(cost) as cost from ${bigQueryDatasetId}.gcp_billing_export_v1_${billingAccountId} where export_time > '${monthStart}' and export_time < '${nextMonth}' group by service.description`;
			const costByLocationQuery = `select location.location as region, sum(cost) as cost from ${bigQueryDatasetId}.gcp_billing_export_v1_${billingAccountId} where export_time > '${monthStart}' and export_time < '${nextMonth}' group by location.location`;
			const costByProjectQuery = `select concat(project.number, " - ", project.name) as project_identifier, sum(cost) as cost from ${bigQueryDatasetId}.gcp_billing_export_v1_${billingAccountId} where export_time > '${monthStart}' and export_time < '${nextMonth}' group by concat(project.number, " - ", project.name)`;

			costByServicePromises.push(runQueryAsJob(bigQuerySvcObj, datasetLocation, costByServiceQuery));
			costByLocationPromises.push(runQueryAsJob(bigQuerySvcObj, datasetLocation, costByLocationQuery));
			costByProjectPromises.push(runQueryAsJob(bigQuerySvcObj, datasetLocation, costByProjectQuery));

			monthStart = nextMonth;
			nextMonth = moment(nextMonth).add(1, "month").startOf("month").format("YYYY-MM-DD");
		}
		const cost = await Promise.all([Promise.all(costByServicePromises), Promise.all(costByLocationPromises), Promise.all(costByProjectPromises)]);
	},
};

async function runQueryAsJob(bigQuerySvcObj, datasetLocation, query) {
	// Run the query as a job
	const [job] = await bigQuerySvcObj.createQueryJob({
		query,
		location: datasetLocation,
	});
	// Wait for the query to finish
	const [rows] = await job.getQueryResults();
	return rows;
}
