const AWS = require('../utils/awsUtil');
const moment = require('moment');

module.exports = {
    fetchBucketsAcrossAllRegions: async () => {
        const s3 = AWS.createNewS3Object();
        const tagSetKey = 'TagSet';
        const bucketRegionKey = 'Region';
        const awsResponseBucketRegionKey = 'LocationConstraint';
        let listOfBuckets = await s3.listBuckets().promise();
        const fetchBucketTagsPromises = [];
        const fetchBucketRegionPromises = [];
        listOfBuckets = listOfBuckets.Buckets;
        listOfBuckets.forEach(bucket => {
            const bucketParams = {Bucket: bucket.Name};
            fetchBucketTagsPromises.push(s3.getBucketTagging(bucketParams).promise());
            fetchBucketRegionPromises.push(s3.getBucketLocation(bucketParams).promise());
        })
        const listOfBucketTags = await Promise.all(fetchBucketTagsPromises);
        const listOfBucketRegions = await Promise.all(fetchBucketRegionPromises);
        for (let index = 0; index < listOfBucketTags.length; index++) {
            listOfBuckets[index][tagSetKey] = listOfBucketTags[index][tagSetKey];
            listOfBuckets[index][bucketRegionKey] = listOfBucketRegions[index][awsResponseBucketRegionKey];
        }
        return listOfBuckets;
    }
}