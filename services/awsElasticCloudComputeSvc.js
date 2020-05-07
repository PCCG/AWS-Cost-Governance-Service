const AWS = require('../utils/awsUtil');

const EC2_RESERVATIONS_KEY = 'Reservations';
const EC2_INSTANCE_ID_PARAM_KEY = 'InstanceIds';

module.exports =  {
    fetchEc2InstancesAcrossRegions: async function (ec2ServiceObject) {
        let instancesAcrossRegions = [];
        const ec2Regions = await this.getEc2Regions(ec2ServiceObject); //Arrow functions do not have their own "this". Hence, the method hasn't been defined using the "Fat Arrow" syntax.
        const ec2DataPromises = [];
        for (region of ec2Regions) {
            let regionName = region.RegionName;
            ec2ServiceObject = AWS.createNewEC2Object(ec2ServiceObject.config.accessKeyId, ec2ServiceObject.config.secretAccessKey, regionName);
            ec2DataPromises.push(ec2ServiceObject.describeInstances().promise());
        }    
        let ec2DataAcrossRegions = await Promise.all(ec2DataPromises);
        instancesAcrossRegions = this.parseListOfEc2InstancesAcrossRegions(ec2DataAcrossRegions);
        return instancesAcrossRegions;   
    },
    parseListOfEc2InstancesAcrossRegions: function (ec2DataAcrossRegions) {
        const instancesAcrossRegions = [];
        ec2DataAcrossRegions.forEach(listOfInstancesSpecificToRegion => {
            listOfInstancesSpecificToRegion[EC2_RESERVATIONS_KEY].forEach(function(instance){
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
        const regionsData = await ec2ServiceObject.describeRegions().promise();
        return regionsData.Regions;
    },
    stopEc2InstancesAssociatedWithAccount: async function (ec2ServiceObject, ec2Tags) {
        const params = {};
        const ec2Regions = await this.getEc2Regions(ec2ServiceObject);
        for (region of ec2Regions) {
            let regionName = region.RegionName;
            ec2ServiceObject = AWS.createNewEC2Object(ec2ServiceObject.config.accessKeyId, ec2ServiceObject.config.secretAccessKey, regionName);
            let ec2DataForRegion = await ec2ServiceObject.describeInstances().promise();
            const instancesSpecificToRegion = this.parseListOfEc2InstancesAcrossRegions([ec2DataForRegion]);
            if (instancesSpecificToRegion.length) {
                instancesSpecificToRegion = instancesSpecificToRegion.map(instanceObj => instanceObj.InstanceId);
                params[EC2_INSTANCE_ID_PARAM_KEY] = instancesSpecificToRegion;
                await ec2ServiceObject.stopInstances(params).promise();
            }
        } 
    },  
    terminateEc2InstancesAssociatedWithAccount: async function (ec2ServiceObject, ec2Tags) {
        const params = {};
        const ec2Regions = await this.getEc2Regions(ec2ServiceObject);
        for (region of ec2Regions) {
            let regionName = region.RegionName;
            ec2ServiceObject = AWS.createNewEC2Object(ec2ServiceObject.config.accessKeyId, ec2ServiceObject.config.secretAccessKey, regionName);
            let ec2DataForRegion = await ec2ServiceObject.describeInstances().promise();
            const instancesSpecificToRegion = this.parseListOfEc2InstancesAcrossRegions([ec2DataForRegion]);
            if (instancesSpecificToRegion.length) {
                instancesSpecificToRegion = instancesSpecificToRegion.map(instanceObj => instanceObj.InstanceId);
                params[EC2_INSTANCE_ID_PARAM_KEY] = instancesSpecificToRegion;
                await ec2ServiceObject.terminateInstances(params).promise();
            }
        } 
    }
}