const AWS = require('../utils/awsUtil');

module.exports =  {
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
    getEc2Regions: async (ec2ContextFromMonitoringService) => {
        const params = {}
        let ec2 = AWS.createNewEC2Obj()
        if(ec2ContextFromMonitoringService) {
            ec2 = ec2ContextFromMonitoringService
        }
        const regionsData = await ec2.describeRegions(params).promise()
        return regionsData.Regions
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