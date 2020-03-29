const AWS = require('../utils/awsUtil');
const moment = require('moment');

module.exports = {
    fetchBucketsAcrossAllRegions: async () => {
        const s3 = AWS.createNewS3Object();
        const tagSetKey = 'TagSet';
        let listOfBuckets = await s3.listBuckets().promise();
        const fetchBucketTagsPromises = [];
        listOfBuckets = listOfBuckets.Buckets;
        listOfBuckets.forEach(bucket => {
            fetchBucketTagsPromises.push(s3.getBucketTagging({Bucket: bucket.Name}).promise());
        })
        const listOfBucketTags = await Promise.all(fetchBucketTagsPromises);
        for (let index = 0; index < listOfBucketTags.length; index++) {
            listOfBuckets[index][tagSetKey] = listOfBucketTags[index][tagSetKey];
        }
        return listOfBuckets;
    }
}