const AWS = require('../utils/awsUtil');
const awsEc2Svc = require('../services/awsElasticCloudComputeSvc');

module.exports = {
    fetchRdsInstancesAcrossAllRegions: async (rdsServiceObject) => {
        let listOfRdsInstances = [];
        const DBInstancesKey = 'DBInstances';
        const describeDBInstancesPromiseCollection = [];
        const regions = await awsEc2Svc.getEc2Regions(AWS.createNewEC2Object(rdsServiceObject.config.accessKeyId, rdsServiceObject.config.secretAccessKey));
        for (let region of regions) {
            rdsServiceObject = AWS.createNewRdsObject(rdsServiceObject.config.accessKeyId, rdsServiceObject.config.secretAccessKey, region.RegionName);
            describeDBInstancesPromiseCollection.push(rdsServiceObject.describeDBInstances().promise());
        }
        listOfRdsInstances = await Promise.all(describeDBInstancesPromiseCollection);
        listOfRdsInstances = listOfRdsInstances.filter((listOfInstancesForRegion) => listOfInstancesForRegion[DBInstancesKey].length)
        return listOfRdsInstances;
    },
    stopRdsInstance: async (rdsServiceObject, DBInstanceIdentifier) => {
        const operationStatus = await rdsServiceObject.stopDBInstance({DBInstanceIdentifier}).promise();
        return operationStatus;
    },
    deleteRdsInstance: async (rdsServiceObject, DBInstanceIdentifier, SkipFinalSnapshot) => {
        const FinalDBSnapshotIdentifier = new Date().toString();
        const operationStatus = SkipFinalSnapshot ? await rdsServiceObject.deleteDBInstance({DBInstanceIdentifier, SkipFinalSnapshot}).promise() : await rds.deleteDBInstance({DBInstanceIdentifier, SkipFinalSnapshot, FinalDBSnapshotIdentifier}).promise();
        return operationStatus;       
    }
}