const AWS = require('../utils/awsUtil');
const moment = require('moment');


const costExplorerDimensionKey = 'SERVICE';
const costExplorerDimensionValue = 'Amazon Elastic Compute Cloud - Compute';
let awsElasticCloudComputeSvc;

module.exports = awsElasticCloudComputeSvc = {
    //Data consumed by the dashboard
    fetchEc2InstancesAcrossRegions: async function () {
        const params = {}
        const instancesAcrossRegions = []
        let ec2 = AWS.createNewEC2Obj();
        const regions = await this.getEc2Regions() //Arrow functions do not have their own "this". Hence, the method hasn't been defined using the "Fat Arrow" syntax.
        const ec2DataPromises = []
        for (region of regions) {
            let regionName = region.RegionName
            AWS.updateAwsRegion(regionName);
            ec2 = AWS.createNewEC2Obj();
            ec2DataPromises.push(ec2.describeInstances(params).promise())
        }     
        let ec2DataAcrossRegions = await Promise.all(ec2DataPromises)
        ec2DataAcrossRegions.forEach(ec2Data => {
            ec2Data["Reservations"].forEach(function(instance){
                instance.Instances.forEach(function(Instance){
                    let obj = {};
                    obj.Tags = Instance.Tags;
                    obj.InstanceId = Instance.InstanceId;
                    obj.InstanceType = Instance.InstanceType;
                    obj.region = Instance.Placement.AvailabilityZone;
                    obj.status = {"code" : Instance.State.Code, "status": Instance.State.Name}
                    instancesAcrossRegions.push(obj);
                })
            })  
        })     
        return instancesAcrossRegions;   
    },
    //Data consumed by the dashboard
    getCostPattern: async () => {
        AWS.updateAwsRegion("us-east-1")
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
            Granularity: 'MONTHLY',
            Metrics: ['BlendedCost']
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
    //Data consumed by the dashboard and the monitoring service

    //costExplorerContextFromMonitoringService - This is the Cost Explorer object passed down by the monitoring service
    //It's probably best to make use of the Cost and Usage Reports (CUR) to analyze the spend instead of the 
    //Cost Explorer APIs. Each request to the Cost Explorer service incurrs a cost of 0.01 USD. Cost and Usage reports
    //on the other hand might end up charging the user 1 USD per year!!!
    getCostCurrentMonth: async (costExplorerContextFromMonitoringService) => {
        AWS.updateAwsRegion('us-east-1')
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
            Granularity: 'MONTHLY',
            Metrics: ['BlendedCost']
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
    },
    getEc2Regions: async (ec2ContextFromMonitoringService) => {
        const params = {}
        let ec2 = AWS.createNewEC2Obj()
        if(ec2ContextFromMonitoringService) {
            ec2 = ec2ContextFromMonitoringService
        }
        const regionsData = await ec2.describeRegions(params).promise()
        return regionsData.Regions
    },
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
        return AWS;
    },
    stopEc2Instances: async (instanceIds, ec2ContextFromMonitoringService) => {
        let ec2 = AWS.createNewEC2Obj()
        if(ec2ContextFromMonitoringService) {
            ec2 = ec2ContextFromMonitoringService
        }
        const params = {
            InstanceIds: [instanceIds]
           }
        const stats = await ec2.stopInstances(params).promise()
        return stats
    },  
    terminateEc2Instances: async (instanceIds, ec2ContextFromMonitoringService) => {
        let ec2 = AWS.createNewEC2Obj()
        if(ec2ContextFromMonitoringService) {
            ec2 = ec2ContextFromMonitoringService
        }
        const params = {
            InstanceIds: [instanceIds]
           }
        const stats = await ec2.terminateInstances(params).promise()
        return stats    
    }
}