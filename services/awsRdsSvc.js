const AWS = require('../utils/awsUtil');
const awsEc2Svc = require('../services/awsElasticCloudComputeSvc');

module.exports = {
    fetchRdsInstancesAcrossAllRegions: async () => {
        let listOfRdsInstances = [];
        const regions = await awsEc2Svc.getEc2Regions();
        const describeDBInstancesPromiseCollection = [];
        for (let region of regions) {
            AWS.updateAwsRegion(region.RegionName);
            const rds = AWS.createNewRdsObject();
            describeDBInstancesPromiseCollection.push(rds.describeDBInstances().promise());
        }
        listOfRdsInstances = await Promise.all(describeDBInstancesPromiseCollection);
        return listOfRdsInstances;
    },
    stopRdsInstance: async (DBInstanceIdentifier) => {
        const rds = AWS.createNewRdsObject();
        const operationStatus = await rds.stopDBInstance({DBInstanceIdentifier}).promise();
        return operationStatus;
    },
    deleteRdsInstance: async (DBInstanceIdentifier, SkipFinalSnapshot) => {
        const rds = AWS.createNewRdsObject();
        const FinalDBSnapshotIdentifier = new Date().toString();
        const operationStatus = SkipFinalSnapshot ? await rds.deleteDBInstance({DBInstanceIdentifier, SkipFinalSnapshot}).promise() : await rds.deleteDBInstance({DBInstanceIdentifier, SkipFinalSnapshot, FinalDBSnapshotIdentifier}).promise();
        return operationStatus;       
    }
}