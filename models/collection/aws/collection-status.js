const Schema = require('mongoose').Schema;
const Model = require('mongoose').model;

const AwsCollectionStatusSchema = new Schema({
    collectionStatus: {
        type: String,
        enum: ['success', 'failed'],
        default: 'success'
    },
    accountId: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    },
    number_of_records: {
        type: Number
    }
});

module.exports = Model('AwsCollectionStatus', AwsCollectionStatusSchema);