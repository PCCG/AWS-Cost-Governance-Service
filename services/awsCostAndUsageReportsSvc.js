const AWS = require('../utils/awsUtil');

module.exports = {
    fetchListOfCostAndUsageReports: async () => {
        const cur = AWS.createNewCurObject();
        let listOfReports = await cur.describeReportDefinitions().promise();
        listOfReports = listOfReports.ReportDefinitions;
        return listOfReports;
    }
}