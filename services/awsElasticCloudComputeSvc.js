const AWS = require('../utils/awsUtil');

const EC2_RESERVATIONS_KEY = 'Reservations';
const EC2_INSTANCES_ID_PARAM_KEY = 'InstanceIds';
const EC2_INSTANCE_ID_PARAM_KEY = 'InstanceId';
const EC2_AVAILABILITY_ZONE_KEY = 'AvailabilityZone';

module.exports =  {
    fetchEc2InstancesAssociatedWithAccount: async function (ec2ServiceObject) {
        let instancesAcrossRegions = [];
        const ec2Regions = await this.getEc2Regions(ec2ServiceObject); //Arrow functions do not have their own "this". Hence, the method hasn't been defined using the "Fat Arrow" syntax.
        const ec2DataPromises = [];
        for (region of ec2Regions) {
            let regionName = region.RegionName;
            ec2ServiceObject = AWS.createNewEC2Object(ec2ServiceObject.config.accessKeyId, ec2ServiceObject.config.secretAccessKey, regionName);
            ec2DataPromises.push(ec2ServiceObject.describeInstances().promise());
        }    
        let ec2DataAcrossRegions = await Promise.all(ec2DataPromises);
        ec2DataAcrossRegions.forEach(listOfInstancesSpecificToRegion => {
            listOfInstancesSpecificToRegion[EC2_RESERVATIONS_KEY].forEach(function(instance){
                instance.Instances.forEach(function(Instance){
                    let obj = {};
                    obj.Tags = Instance.Tags;
                    obj[EC2_INSTANCE_ID_PARAM_KEY] = Instance[EC2_INSTANCE_ID_PARAM_KEY];
                    obj.InstanceType = Instance.InstanceType;
                    obj[EC2_AVAILABILITY_ZONE_KEY] = Instance.Placement[EC2_AVAILABILITY_ZONE_KEY];
                    obj.status = {"code" : Instance.State.Code, "status": Instance.State.Name}
                    instancesAcrossRegions.push(obj);
                })
            })
        })
        return instancesAcrossRegions;
    },
    listInstancesAssociatedWithAccountByRegion: async function (ec2ServiceObject) {
        const listOfInstances = {};
        const ec2InstancesAssociatedWithAccount = await this.fetchEc2InstancesAssociatedWithAccount(ec2ServiceObject);
        ec2InstancesAssociatedWithAccount.forEach(instance => {
            const region = AWS.convertAvailabilityZoneToRegion(instance[EC2_AVAILABILITY_ZONE_KEY]);
            if (!listOfInstances[region]) {
                listOfInstances[region] = [];
            }
            listOfInstances[region].push(instance);
        })
        return listOfInstances;
    },
    createEbsSnaphotsForInstancesAssociatedWithAccount: async function (ec2ServiceObject) {
        const params = {
            InstanceSpecification: {}
        };
        const snapshotOperationPromises = [];
        let snapshotDescription = 'Creation of a snapshot initiated by the Cost Governance Service for the instance with the ID ';
        const ec2InstancesAssociatedWithAccountByRegion = await this.listInstancesAssociatedWithAccountByRegion(ec2ServiceObject);
        for (region in ec2InstancesAssociatedWithAccountByRegion) {
            ec2ServiceObject = AWS.createNewEC2Object(ec2ServiceObject.config.accessKeyId, ec2ServiceObject.config.secretAccessKey, region);
            ec2InstancesAssociatedWithAccountByRegion[region].forEach(instanceObj => {
                const ec2InstanceId = instanceObj[EC2_INSTANCE_ID_PARAM_KEY];
                params.InstanceSpecification[EC2_INSTANCE_ID_PARAM_KEY] = ec2InstanceId;
                params.Description = snapshotDescription.concat(ec2InstanceId);
                snapshotOperationPromises.push(ec2ServiceObject.createSnapshots(params).promise());
            })
        }
        const snapshotOperationStatus = await Promise.all(snapshotOperationPromises);
    },
    getEc2Regions: async (ec2ServiceObject) => {
        const regionsData = await ec2ServiceObject.describeRegions().promise();
        return regionsData.Regions;
    },
    stopEc2InstancesAssociatedWithAccount: async function (ec2ServiceObject, ec2Tags) {
        const params = {};
        const ec2InstancesAssociatedWithAccountByRegion = await this.listInstancesAssociatedWithAccountByRegion(ec2ServiceObject);
        for (region in ec2InstancesAssociatedWithAccountByRegion) {
            ec2ServiceObject = AWS.createNewEC2Object(ec2ServiceObject.config.accessKeyId, ec2ServiceObject.config.secretAccessKey, region);
            const instancesSpecificToRegion = ec2InstancesAssociatedWithAccountByRegion[region].map(instanceObj => instanceObj[EC2_INSTANCE_ID_PARAM_KEY]);
            params[EC2_INSTANCES_ID_PARAM_KEY] = instancesSpecificToRegion;
            const operationStatus = await ec2ServiceObject.stopInstances(params).promise();
        } 
    },  
    terminateEc2InstancesAssociatedWithAccount: async function (ec2ServiceObject, ec2Tags) {
        const params = {};
        const ec2InstancesAssociatedWithAccountByRegion = await this.listInstancesAssociatedWithAccountByRegion(ec2ServiceObject);
        for (region in ec2InstancesAssociatedWithAccountByRegion) {
            ec2ServiceObject = AWS.createNewEC2Object(ec2ServiceObject.config.accessKeyId, ec2ServiceObject.config.secretAccessKey, region);
            const instancesSpecificToRegion = ec2InstancesAssociatedWithAccountByRegion[region].map(instanceObj => instanceObj[EC2_INSTANCE_ID_PARAM_KEY]);
            params[EC2_INSTANCES_ID_PARAM_KEY] = instancesSpecificToRegion;
            const operationStatus = await ec2ServiceObject.terminateInstances(params).promise();
        } 
    }
}