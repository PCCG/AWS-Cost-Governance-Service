const AWS = require('../utils/awsUtil');
const moment = require('moment');

const costExplorerDimensionKey = 'SERVICE';
const spendGranularity = 'MONTHLY';
const costMetric = 'BlendedCost';
const costExplorerEndpointRegion = 'us-east-1';

module.exports = {
    validateIfAwsCredsPresent: (requestBody, res) => {
        let accessId = requestBody.accessId;
        let secretKey = requestBody.secretKey;
        if(!accessId || !secretKey){
            console.error("The IAM user credentials aren't properly defined...");
            res.status(400).send();
            return;		
        }
        AWS.updateAwsAccessKeyId(accessId);
        AWS.updateAwsSecretAccessKey(secretKey);
    },
    getCostPattern: async (costExplorerDimensionValue) => {
        AWS.updateAwsRegion(costExplorerEndpointRegion);
        const costExplorer = AWS.createNewCostExplorerObj()
        let costPattern = {}
        const costParams = {
            TimePeriod: {
                End: moment().startOf('day').format('YYYY-MM-DD'), 
                Start: moment().subtract(6, 'month').startOf('month').format('YYYY-MM-DD')
            },
            Filter: {
                Dimensions: {
                    Key: costExplorerDimensionKey,
                    Values: [costExplorerDimensionValue]
                }
            },
            Granularity: spendGranularity,
            Metrics: [costMetric]
        }
        let costData = await costExplorer.getCostAndUsage(costParams).promise()
        costData.ResultsByTime.forEach(timePeriod => {
            let monthIndex = parseInt(timePeriod.TimePeriod.Start.split('-')[1])
            let cost = timePeriod.Total.BlendedCost.Amount
            let month = moment(monthIndex.toString(), 'MM').format('MMMM');
            costPattern[month] = cost;
        })
        return costPattern
    },
    //costExplorerContextFromMonitoringService - This is the Cost Explorer object passed down by the monitoring service
    //It's probably best to make use of the Cost and Usage Reports (CUR) to analyze the spend instead of the 
    //Cost Explorer APIs. Each request to the Cost Explorer service incurrs a cost of 0.01 USD. Cost and Usage reports
    //on the other hand might end up charging the user 1 USD per year!!!
    getCostCurrentMonth: async (costExplorerDimensionValue, costExplorerContextFromMonitoringService) => {
        AWS.updateAwsRegion(costExplorerEndpointRegion);
        let costExplorer = AWS.createNewCostExplorerObj()
        const costParams = {
            TimePeriod: {
                End: moment().startOf('day').format('YYYY-MM-DD'), 
                Start: moment().startOf('month').format('YYYY-MM-DD')
            },
            Filter: {
                Dimensions: {
                    Key: costExplorerDimensionKey,
                    Values: [costExplorerDimensionValue]
                }
            },
            Granularity: spendGranularity,
            Metrics: [costMetric]
        }
        if(costExplorerContextFromMonitoringService) {
            costExplorer = costExplorerContextFromMonitoringService
        }
        try {
            const costData = await costExplorer.getCostAndUsage(costParams).promise()
            let cost = costData.ResultsByTime[0].Total.BlendedCost
            return cost.Amount
        } catch (e) {
            console.log(e.name)
            console.log(e.message)
        }
    }
}