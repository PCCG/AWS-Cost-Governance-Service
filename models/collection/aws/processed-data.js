const Schema = require('mongoose').Schema;
const Model = require('mongoose').model;

const AwsCollectionProcessedDataSchema = new Schema({
    accountId: {
        required: true,
        type: String
    },
    costReport: {
        required: true,
        type: Array
    }
});

module.exports = Model('AwsCurProcessedData', AwsCollectionProcessedDataSchema);