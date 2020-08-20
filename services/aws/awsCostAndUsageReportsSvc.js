module.exports = {
    fetchListOfCostAndUsageReports: async (curServiceObject) => {
        let listOfReports = await curServiceObject.describeReportDefinitions().promise();
        listOfReports = listOfReports.ReportDefinitions;
        return listOfReports;
    }
}