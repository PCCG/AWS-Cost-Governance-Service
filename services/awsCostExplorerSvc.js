const moment = require('moment');

const costExplorerDimensionKey = 'SERVICE';
const spendGranularity = 'MONTHLY';
const costMetric = 'BlendedCost';

module.exports = {
    getCostPattern: async (ceServiceObject, costExplorerDimensionValue) => {
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
        let costData = await ceServiceObject.getCostAndUsage(costParams).promise()
        costData.ResultsByTime.forEach(timePeriod => {
            let monthIndex = parseInt(timePeriod.TimePeriod.Start.split('-')[1]);
            let cost = timePeriod.Total.BlendedCost.Amount;
            let month = moment(monthIndex.toString(), 'MM').format('MMMM');
            costPattern[month] = cost;
        })
        return costPattern
    },
    //costExplorerContextFromMonitoringService - This is the Cost Explorer object passed down by the monitoring service
    //It's probably best to make use of the Cost and Usage Reports (CUR) to analyze the spend instead of the 
    //Cost Explorer APIs. Each request to the Cost Explorer service incurrs a cost of 0.01 USD. Cost and Usage reports
    //on the other hand might end up charging the user 1 USD per year!!!
    getCostCurrentMonth: async (ceServiceObject, costExplorerDimensionValue) => {
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
        try {
            const costData = await ceServiceObject.getCostAndUsage(costParams).promise()
            let cost = costData.ResultsByTime[0].Total.BlendedCost
            return cost.Amount
        } catch (e) {
            console.log(e.name)
            console.log(e.message)
        }
    }
}