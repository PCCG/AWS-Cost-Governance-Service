const AWS = require('../utils/awsUtil');

module.exports =  {
    fetchEc2InstancesAcrossRegions: async function (ec2ServiceObject) {
        const params = {};
        const instancesAcrossRegions = [];
        const regions = await this.getEc2Regions(ec2ServiceObject); //Arrow functions do not have their own "this". Hence, the method hasn't been defined using the "Fat Arrow" syntax.
        const ec2DataPromises = [];
        for (region of regions) {
            let regionName = region.RegionName;
            ec2ServiceObject = AWS.createNewEC2Object(ec2ServiceObject.config.accessKeyId, ec2ServiceObject.config.secretAccessKey, regionName);
            ec2DataPromises.push(ec2ServiceObject.describeInstances(params).promise());
        }    
        let ec2DataAcrossRegions = await Promise.all(ec2DataPromises);
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
    createEbsSnaphotsForInstancesAssociatedWithAccount: async function (ec2ServiceObject) {
        const params = {
            InstanceSpecification: {
              ExcludeBootVolume: true
            }
        };
        const snapshotPromises = [];
        const instanceIdsForAllInstances = await this.getInstanceIdsForAllInstancesAssociatedWithAccount();
        instanceIdsForAllInstances.forEach((instance) => {
            params.Description = new Date().toString();
            params.InstanceSpecification.InstanceId = instance;
            snapshotPromises.push(ec2ServiceObject.createSnapshots(params).promise().catch(err => {
                console.log(err);
            }));
        });
        const snapshotOperationStatus = await Promise.all(snapshotPromises);
    },
    getEc2Regions: async (ec2ServiceObject) => {
        const params = {};
        const regionsData = await ec2ServiceObject.describeRegions(params).promise();
        return regionsData.Regions;
    },
    stopEc2InstancesAssociatedWithAccount: async function (ec2ServiceObject) {
        const instanceIdsForAllInstances = await this.getInstanceIdsForAllInstancesAssociatedWithAccount();
        const params = {
            InstanceIds: instanceIdsForAllInstances
        };
        const stats = await ec2ServiceObject.stopInstances(params).promise();
        return stats;
    },  
    terminateEc2InstancesAssociatedWithAccount: async function (ec2ServiceObject) {
        const ec2Regions = await this.getEc2Regions(ec2ServiceObject);
        const params = {
            InstanceIds: instanceIdsForAllInstances
        };
        const stats = await ec2ServiceObject.terminateInstances(params).promise();
        return stats;
    }
}