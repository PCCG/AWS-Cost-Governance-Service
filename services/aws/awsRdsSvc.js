const AWS = require('../../utils/awsUtil');
const awsEc2Svc = require('../../services/aws/awsElasticCloudComputeSvc');

const RDS_INSTANCES_KEY = 'DBInstances';
const RDS_INSTANCE_IDENTIFIER = 'DBInstanceIdentifier';
const RDS_INSTANCE_REGION_KEY = 'RegionName';

module.exports = {
    fetchRdsInstancesAssociatedWithAccount: async (rdsServiceObject) => {
        let listOfRdsInstances = [];
        const describeDBInstancesPromiseCollection = [];
        const regions = await awsEc2Svc.getEc2Regions(AWS.createNewEC2Object(rdsServiceObject.config.accessKeyId, rdsServiceObject.config.secretAccessKey));
        for (let region of regions) {
            rdsServiceObject = AWS.createNewRdsObject(rdsServiceObject.config.accessKeyId, rdsServiceObject.config.secretAccessKey, region[RDS_INSTANCE_REGION_KEY]);
            describeDBInstancesPromiseCollection.push(rdsServiceObject.describeDBInstances().promise());
        }
        listOfRdsInstances = await Promise.all(describeDBInstancesPromiseCollection);
        for (let index in listOfRdsInstances) {
            listOfRdsInstances[index][RDS_INSTANCE_REGION_KEY] = regions[index][RDS_INSTANCE_REGION_KEY];
        }
        listOfRdsInstances = listOfRdsInstances.filter((listOfInstancesForRegion) => listOfInstancesForRegion[RDS_INSTANCES_KEY].length)
        return listOfRdsInstances;
    },
    stopRdsInstancesAssociatedWithAccount: async function (rdsServiceObject) {
        const params = {};
        const operationDescriptionList = [];
        const rdsInstancesAssociatedWithAccount = await this.fetchRdsInstancesAssociatedWithAccount(rdsServiceObject);
        const stopRdsInstancePromises = [];
        rdsInstancesAssociatedWithAccount.forEach(rdsInstancesInRegion => {
            const region = rdsInstancesInRegion[RDS_INSTANCE_REGION_KEY];
            rdsServiceObject = AWS.createNewRdsObject(rdsServiceObject.config.accessKeyId, rdsServiceObject.config.secretAccessKey, region);
            rdsInstancesInRegion[RDS_INSTANCES_KEY].forEach(rdsInstance => {
                const rdsInstanceIdentifier = rdsInstance[RDS_INSTANCE_IDENTIFIER];
                const operationDescription = `The following RDS instance present in the region ${region} is going to be terminated: ${rdsInstanceIdentifier}`;
                operationDescriptionList.push(operationDescription);
                params[RDS_INSTANCE_IDENTIFIER] = rdsInstanceIdentifier;
                stopRdsInstancePromises.push(rdsServiceObject.stopDBInstance(params).promise());
            })
        })
        const operationStatus = await Promise.all(stopRdsInstancePromises);
    },
    deleteRdsInstancesAssociatedWithAccount: async function (rdsServiceObject, SkipFinalSnapshot = true) {
        const params = {};
        const operationDescriptionList = [];
        const FINAL_DB_SNAPSHOT_IDENTIFIER_KEY = 'FinalDBSnapshotIdentifier';
        const SKIP_FINAL_SNAPSHOT_KEY = 'SkipFinalSnapshot';
        const rdsInstancesAssociatedWithAccount = await this.fetchRdsInstancesAssociatedWithAccount(rdsServiceObject);
        const deleteRdsInstancePromises = [];
        params[SKIP_FINAL_SNAPSHOT_KEY] = SkipFinalSnapshot;
        rdsInstancesAssociatedWithAccount.forEach(rdsInstancesInRegion => {
            const region = rdsInstancesInRegion[RDS_INSTANCE_REGION_KEY];
            rdsServiceObject = AWS.createNewRdsObject(rdsServiceObject.config.accessKeyId, rdsServiceObject.config.secretAccessKey, region);
            rdsInstancesInRegion[RDS_INSTANCES_KEY].forEach(rdsInstance => {
                const rdsInstanceIdentifier = rdsInstance[RDS_INSTANCE_IDENTIFIER];
                let operationDescription = `The following RDS instance present in the region ${region} is going to be terminated: ${rdsInstanceIdentifier}`;
                if (!SkipFinalSnapshot) {
                    operationDescription = `Creation of a snapshot for the RDS instance with the ID ${rdsInstanceIdentifier} in the region ${region} initiated by the Cost Governance Service before termination of the RDS instance`;
                    const awsCompatibleFinalDBSnapshotIdentifier = operationDescription.split(' ').join('-');
                    params[FINAL_DB_SNAPSHOT_IDENTIFIER_KEY] = awsCompatibleFinalDBSnapshotIdentifier;
                }
                operationDescriptionList.push(operationDescription);
                params[RDS_INSTANCE_IDENTIFIER] = rdsInstanceIdentifier;
                const deleteRdsInstancePromise = SkipFinalSnapshot ? rdsServiceObject.deleteDBInstance(params).promise() : rdsServiceObject.deleteDBInstance(params).promise();
                deleteRdsInstancePromises.push(deleteRdsInstancePromise);
            })
        })
        const operationStatus = await Promise.all(deleteRdsInstancePromises);
    }
}
